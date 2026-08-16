const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  direction:     { type: String, enum: ["inbound", "outbound"], required: true },
  resendEmailId: { type: String },
  from:          { type: String, required: true },
  to:            { type: [String], required: true },
  subject:       { type: String },
  html:          { type: String },
  text:          { type: String },
  threadKey:     { type: String }, // the "other party" address, used to group a conversation
  read:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Email", emailSchema);