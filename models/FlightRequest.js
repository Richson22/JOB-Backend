const mongoose = require("mongoose");

const flightRequestSchema = new mongoose.Schema({
  fullName:         { type: String, required: true },
  email:            { type: String, required: true },
  phone:            { type: String, required: true },
  rank:             { type: String },
  branch:           { type: String, required: true },
  status:           { type: String, required: true }, // military status: Active Duty, Retired, etc.
  departureCity:    { type: String, required: true },
  destinationCity:  { type: String, required: true },
  departureDate:    { type: String, required: true },
  returnDate:       { type: String },
  passengers:       { type: String, required: true },
  tripType:         { type: String, required: true },
  payment:          { type: String },
  notes:            { type: String },
  requestStatus:    { type: String, enum: ["Pending", "Reviewed", "Resolved"], default: "Pending" },
  requestRef:        { type: String, unique: true },
}, { timestamps: true });

flightRequestSchema.pre("save", function (next) {
  if (!this.requestRef) {
    this.requestRef = "FLT-" + Date.now().toString().slice(-8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("FlightRequest", flightRequestSchema);