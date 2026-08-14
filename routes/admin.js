const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Application = require("../models/Application");
const User = require("../models/User");
const { sendAdminOTP, sendStatusUpdateEmail } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;

function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

router.post("/register", async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: "Admin created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });
    const match = await admin.comparePassword(req.body.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/applications", protect, async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/applications/:id", protect, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!app) return res.status(404).json({ message: "Not found" });
    if (req.body.status) {
      sendStatusUpdateEmail(app.email, app.fullName, app).catch(console.error);
    }
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/applications/:id", protect, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin creates a service member record + generates their service number.
// Since login is now service-number-only (no password check), the password
// field is filled with a random value just to satisfy the schema — it's
// never used to authenticate.
router.post("/users", protect, async (req, res) => {
  try {
    const {
      fullName, email, rank, rankTitle, payGrade, mos, unit, squadSize,
      phone, dob, photo, clearance, status, yearsOfService,
      monthlyPay, bah, tspSavings, leaveBalance, retirementPoints,
      base, nextPCS, brief,
    } = req.body;

    const year = new Date().getFullYear();
    const countThisYear = await User.countDocuments({
      serviceNumber: { $regex: `^MIL-${year}-` },
    });
    const serviceNumber = `MIL-${year}-${String(countThisYear + 1).padStart(3, "0")}`;

    const randomPassword = require("crypto").randomBytes(16).toString("hex");

    const user = new User({
      fullName, email, password: randomPassword, serviceNumber,
      rank, rankTitle, payGrade, mos, unit, squadSize,
      phone, dob, photo, clearance, status, yearsOfService,
      monthlyPay, bah, tspSavings, leaveBalance, retirementPoints,
      base, nextPCS, brief,
    });
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/users/:id", protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // never allow password changes through this route
    delete updates.serviceNumber; // service number is fixed once generated

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/users/:id", protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, protect };