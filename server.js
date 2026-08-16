const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// The email webhook needs the RAW request body for Resend's signature
// verification, so it must be excluded from the global JSON parser.
app.use((req, res, next) => {
  if (req.originalUrl === "/api/emails/webhook") return next();
  express.json({ limit: "10mb" })(req, res, next);
});

const { router: authRouter } = require("./routes/auth");
const applicationsRouter = require("./routes/applications");
const { router: adminRouter } = require("./routes/admin");
const flightRequestsRouter = require("./routes/flightRequests");
const scamReportsRouter = require("./routes/scamReports");
const emailsRouter = require("./routes/emails");

app.use("/api/auth",           authRouter);
app.use("/api/applications",   applicationsRouter);
app.use("/api/admin",          adminRouter);
app.use("/api/flight-requests", flightRequestsRouter);
app.use("/api/scam-reports",   scamReportsRouter);
app.use("/api/emails",         emailsRouter);

app.get("/", (req, res) => res.json({ message: "Ukraine Military Welfare API running" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
  })
  .catch((err) => console.error("DB error:", err));