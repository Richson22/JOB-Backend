const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otpCode:   { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);