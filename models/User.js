const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName:         { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  serviceNumber:    { type: String },
  rank:             { type: String },
  rankTitle:        { type: String },
  payGrade:         { type: String },
  mos:              { type: String },
  unit:             { type: String },
  squadSize:        { type: Number },
  phone:            { type: String },
  dob:              { type: String },
  photo:            { type: String }, // stored as a base64 data URL
  clearance:        { type: String, default: "NONE" },
  status:           { type: String, default: "ACTIVE DUTY" },
  yearsOfService:   { type: Number },
  monthlyPay:       { type: String },
  bah:              { type: String },
  tspSavings:       { type: String },
  leaveBalance:     { type: String },
  retirementPoints: { type: Number },
  base:             { type: String },
  nextPCS:          { type: String },
  brief:            { type: String },
  isVerified:       { type: Boolean, default: false },

  // Service Record tab
  ssn:              { type: String }, // ⚠️ see security note below
  maritalStatus:    { type: String },
  dependents:       { type: String },
  emergencyContact: { type: String },
  emergencyPhone:   { type: String },
  homeAddress:      { type: String },
  cityState:        { type: String },
  enlistmentDate:   { type: String },
  etsDate:          { type: String },
  medicalStatus:    { type: String },
  lastPhysical:     { type: String },
  allergies:        { type: String },
  immunizations:    { type: String },
  dentalStatus:     { type: String },

  // Combat Proficiency tab
  combatSkills: {
    combatStrength:     { type: Number },
    marksmanship:       { type: Number },
    tacticalOperations: { type: Number },
    strategicPlanning:  { type: Number },
    leadership:         { type: Number },
    physicalFitness:    { type: Number },
  },
  specializedSkills: [{ name: String, level: String }],
  combatOperations:  [{ name: String, date: String, location: String, description: String }],

  // Training tab
  educationHistory: [{ institution: String, degree: String, year: String }],
  militaryTraining: [{ name: String, completedDate: String }],
  certifications:   [{ name: String, issuer: String, expiryDate: String }],
  upcomingTraining: [{ name: String, date: String, location: String }],
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);