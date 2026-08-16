const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const LOGO_URL = process.env.LOGO_URL || "https://ukrainemilitarywelfare.org/logo.jpg";

const emailWrapper = (content) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:24px;border-radius:12px;">
    <div style="background:#003087;border-radius:10px;padding:20px 28px;display:flex;align-items:center;gap:14px;margin-bottom:20px;">
      <img src="${LOGO_URL}" alt="Ukraine Military Welfare" width="44" height="44" style="border-radius:50%;display:block;object-fit:cover;" />
      <div>
        <div style="color:#fff;font-size:16px;font-weight:800;">Ukraine Military Welfare</div>
        <div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Official Department</div>
      </div>
    </div>
    ${content}
    <div style="text-align:center;margin-top:20px;">
      <p style="font-size:11px;color:#94a3b8;margin:0;">This is an automated message. Please do not reply to this email.</p>
      <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">© ${new Date().getFullYear()} Ukraine Military Welfare Department</p>
    </div>
  </div>
`;

async function sendWelcomeEmail(toEmail, fullName) {
  const { error } = await resend.emails.send({
    from: "Ukraine Military Welfare <noreply@yourdomain.com>",
    reply_to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    to: [toEmail],
    subject: "Welcome to Ukraine Military Welfare Portal",
    html: emailWrapper(`
      <div style="background:#fff;border-radius:10px;padding:28px;margin-bottom:16px;">
        <p style="font-size:15px;font-weight:700;color:#003087;margin:0 0 12px;">Welcome, ${fullName}!</p>
        <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
          Your account has been successfully created on the Ukraine Military Welfare Department portal.
          You can now log in to apply for leave, check your application status, and access your benefits.
        </p>
        <a href="#" style="display:inline-block;background:#003087;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Access Your Portal →</a>
      </div>
    `),
  });
  if (error) throw new Error(error.message);
}

async function sendApplicationConfirmation(toEmail, fullName, application) {
  const { error } = await resend.emails.send({
    from: "Ukraine Military Welfare <noreply@yourdomain.com>",
    reply_to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    to: [toEmail],
    subject: `Leave Application Received — ${application.applicationRef}`,
    html: emailWrapper(`
      <div style="background:#fff;border-radius:10px;padding:28px;margin-bottom:16px;">
        <p style="font-size:15px;font-weight:700;color:#003087;margin:0 0 12px;">Application Received, ${fullName}</p>
        <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
          Your leave application has been submitted and is currently under review.
        </p>
        <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
          <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.1em;">APPLICATION REFERENCE</p>
          <p style="margin:0;font-size:1.4rem;font-weight:800;color:#FFD700;background:#003087;padding:8px;border-radius:6px;">${application.applicationRef}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#64748b;">Leave Type</td>
            <td style="padding:8px 0;color:#003087;font-weight:700;text-align:right;">${application.leaveType}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#64748b;">Start Date</td>
            <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${application.startDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">End Date</td>
            <td style="padding:8px 0;color:#1e293b;font-weight:600;text-align:right;">${application.endDate}</td>
          </tr>
        </table>
      </div>
    `),
  });
  if (error) throw new Error(error.message);
}

async function sendStatusUpdateEmail(toEmail, fullName, application) {
  const statusColor = application.status === "Approved" ? "#16a34a" : application.status === "Rejected" ? "#dc2626" : "#f97316";
  const { error } = await resend.emails.send({
    from: "Ukraine Military Welfare <noreply@yourdomain.com>",
    reply_to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    to: [toEmail],
    subject: `Application ${application.status} — ${application.applicationRef}`,
    html: emailWrapper(`
      <div style="background:#fff;border-radius:10px;padding:28px;margin-bottom:16px;">
        <p style="font-size:15px;font-weight:700;color:#003087;margin:0 0 12px;">Application Update, ${fullName}</p>
        <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
          Your leave application <strong>${application.applicationRef}</strong> has been updated.
        </p>
        <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:8px;margin-bottom:16px;">
          <span style="background:${statusColor};color:#fff;font-size:14px;font-weight:800;padding:8px 24px;border-radius:20px;">${application.status}</span>
        </div>
        ${application.adminNote ? `<p style="font-size:13px;color:#374151;background:#fff8e1;padding:12px;border-radius:8px;border-left:4px solid #FFD700;"><strong>Note from department:</strong> ${application.adminNote}</p>` : ""}
      </div>
    `),
  });
  if (error) throw new Error(error.message);
}

async function sendAdminOTP(toEmail, otp) {
  const { error } = await resend.emails.send({
    from: "Ukraine Military Welfare <noreply@yourdomain.com>",
    reply_to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
    to: [toEmail],
    subject: "Admin Login OTP — Ukraine Military Welfare",
    html: emailWrapper(`
      <div style="background:#fff;border-radius:10px;padding:28px;text-align:center;">
        <p style="color:#003087;font-weight:700;font-size:15px;margin:0 0 16px;">Your Admin Login Code</p>
        <div style="background:#003087;border-radius:8px;padding:20px;margin-bottom:16px;">
          <p style="margin:0;font-size:2rem;font-weight:800;color:#FFD700;letter-spacing:0.2em;">${otp}</p>
        </div>
        <p style="color:#64748b;font-size:13px;margin:0;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
      </div>
    `),
  });
  if (error) throw new Error(error.message);
}

module.exports = { sendWelcomeEmail, sendApplicationConfirmation, sendStatusUpdateEmail, sendAdminOTP, emailWrapper };