const express = require("express");
const router = express.Router();
const ScamReport = require("../models/ScamReport");

// Public — anyone can report a scam, no login required
router.post("/", async (req, res) => {
  try {
    const {
      fullName, email, phone, scamType, contactMethod,
      incidentDate, amountLost, description, suspectInfo,
    } = req.body;

    const scamReport = new ScamReport({
      fullName, email, phone, scamType, contactMethod,
      incidentDate, amountLost, description, suspectInfo,
    });
    await scamReport.save();
    res.status(201).json(scamReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;