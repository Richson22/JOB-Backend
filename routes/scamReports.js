const express = require("express");
const router = express.Router();
const ScamReport = require("../models/ScamReport");
const { protect } = require("./admin");

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

router.get("/", protect, async (req, res) => {
  try {
    const reports = await ScamReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const report = await ScamReport.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!report) return res.status(404).json({ message: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await ScamReport.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;