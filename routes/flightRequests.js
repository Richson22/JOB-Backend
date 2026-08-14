const express = require("express");
const router = express.Router();
const FlightRequest = require("../models/FlightRequest");
const { protect } = require("./admin");

// Public — anyone can submit a flight request, no login required
router.post("/", async (req, res) => {
  try {
    const {
      fullName, email, phone, rank, branch, status,
      departureCity, destinationCity, departureDate, returnDate,
      passengers, tripType, payment, notes,
    } = req.body;

    const flightRequest = new FlightRequest({
      fullName, email, phone, rank, branch, status,
      departureCity, destinationCity, departureDate, returnDate,
      passengers, tripType, payment, notes,
    });
    await flightRequest.save();
    res.status(201).json(flightRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const requests = await FlightRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const request = await FlightRequest.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await FlightRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;