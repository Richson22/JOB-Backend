const express = require("express");
const router = express.Router();
const FlightRequest = require("../models/FlightRequest");

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

module.exports = router;