const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;

function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, serviceNumber, rank, unit, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = new User({ fullName, email, password, serviceNumber, rank, unit, phone });
    await user.save();
    sendWelcomeEmail(email, fullName).catch(console.error);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { serviceNumber } = req.body;
    if (!serviceNumber) {
      return res.status(400).json({ message: "Service number is required" });
    }
    const user = await User.findOne({ serviceNumber });
    if (!user) return res.status(401).json({ message: "Service number not found" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, rank: user.rank, unit: user.unit } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, protect };