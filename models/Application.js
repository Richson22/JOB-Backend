const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName:       { type: String, required: true },
  email:          { type: String, required: true },
  serviceNumber:  { type: String, required: true },
  rank:           { type: String, required: true },
  unit:           { type: String, required: true },
  phone:          { type: String },
  leaveType:      {
    type: String,
    enum: ["Adoption Block Leave", "Pregnancy Home Leave", "Special Terminal Leave", "Annual Leave", "Emergency Leave", "Medical Leave"],
    required: true,
  },
  startDate:      { type: String, required: true },
  endDate:        { type: String, required: true },
  reason:         { type: String, required: true },
  status:         { type: String, enum: ["Pending", "Approved", "Rejected", "Under Review"], default: "Pending" },
  adminNote:      { type: String },
  applicationRef: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate reference number
applicationSchema.pre("save", function () {
  if (!this.applicationRef) {
    this.applicationRef = "UMW-" + Date.now().toString().slice(-8).toUpperCase();
  }
});

module.exports = mongoose.model("Application", applicationSchema);