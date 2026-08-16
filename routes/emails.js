const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const Email = require("../models/Email");
const { protect } = require("./admin");
const { emailWrapper } = require("../utils/sendEmail");

const resend = new Resend(process.env.RESEND_API_KEY);

// Your real Resend receiving address — set this in your .env once you've
// configured receiving in the Resend dashboard, e.g. support@yourdomain.com
const SUPPORT_ADDRESS = process.env.SUPPORT_EMAIL || "support@yourdomain.com";

function normalizeThreadKey(fromAddr, toAddrs) {
  const all = [fromAddr, ...(Array.isArray(toAddrs) ? toAddrs : [toAddrs])].filter(Boolean);
  const other = all.find((a) => a.toLowerCase() !== SUPPORT_ADDRESS.toLowerCase());
  return (other || fromAddr || "").toLowerCase();
}

// ── Webhook: Resend calls this whenever a new email arrives ──
// This route needs the RAW request body for signature verification —
// see the server.js change that excludes this path from the global
// express.json() parser.
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = resend.webhooks.verify({
      payload: req.body,
      headers: {
        id: req.headers["svix-id"],
        timestamp: req.headers["svix-timestamp"],
        signature: req.headers["svix-signature"],
      },
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });

    if (event.type === "email.received") {
      const { data: full } = await resend.emails.receiving.get(event.data.email_id);

      await Email.create({
        direction: "inbound",
        resendEmailId: event.data.email_id,
        from: full?.from || event.data.from,
        to: full?.to || event.data.to,
        subject: full?.subject || event.data.subject,
        html: full?.html || "",
        text: full?.text || "",
        threadKey: normalizeThreadKey(full?.from || event.data.from, full?.to || event.data.to),
      });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Email webhook error:", err);
    res.status(400).json({ message: err.message });
  }
});

// ── Admin: list all emails (inbox), newest first ──
router.get("/", protect, async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: get a full thread with one address ──
router.get("/thread/:address", protect, async (req, res) => {
  try {
    const emails = await Email.find({ threadKey: req.params.address.toLowerCase() }).sort({ createdAt: 1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: send an email (also saved into the thread) ──
router.post("/send", protect, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const styledHtml = emailWrapper(`
      <div style="background:#fff;border-radius:10px;padding:28px;">
        <div style="font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;">${html}</div>
      </div>
    `);

    const { data, error } = await resend.emails.send({
      from: `Ukraine Military Welfare <${SUPPORT_ADDRESS}>`,
      replyTo: SUPPORT_ADDRESS,
      to: [to],
      subject,
      html: styledHtml,
      text,
    });
    if (error) throw new Error(error.message);

    const saved = await Email.create({
      direction: "outbound",
      resendEmailId: data?.id,
      from: SUPPORT_ADDRESS,
      to: [to],
      subject,
      html: styledHtml,
      text,
      threadKey: to.toLowerCase(),
      read: true,
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Admin: mark an email read ──
router.put("/:id/read", protect, async (req, res) => {
  try {
    const email = await Email.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;