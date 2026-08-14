const mongoose = require("mongoose");

const scamReportSchema = new mongoose.Schema({
  fullName:       { type: String, required: true },
  email:          { type: String, required: true },
  phone:          { type: String, required: true },
  scamType:       { type: String, required: true },
  contactMethod:  { type: String, required: true },
  incidentDate:   { type: String, required: true },
  amountLost:     { type: String },
  description:    { type: String, required: true },
  suspectInfo:    { type: String },
  reportStatus:   { type: String, enum: ["Pending", "Reviewed", "Resolved"], default: "Pending" },
  reportRef:      { type: String, unique: true },
}, { timestamps: true });

scamReportSchema.pre("save", function (next) {
  if (!this.reportRef) {
    this.reportRef = "SCR-" + Date.now().toString().slice(-8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("ScamReport", scamReportSchema);