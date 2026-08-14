const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const { protect } = require("./auth");
const { sendApplicationConfirmation } = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const { fullName, email, serviceNumber, rank, unit, phone, leaveType, startDate, endDate, reason } = req.body;
    const application = new Application({
      fullName, email, serviceNumber, rank, unit, phone,
      leaveType, startDate, endDate, reason,
    });
    await application.save();
    sendApplicationConfirmation(email, fullName, application).catch(console.error);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;