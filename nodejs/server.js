const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");

dotenv.config();

const app = express();

// Load Mail Service
require("./config/mailer");

// Ensure Uploads Folder Exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Uploads directory created");
}

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://xpert-nettoyage-fr-671126.hostingersite.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static File Access
app.use("/uploads", express.static(uploadDir));

// Health Checks
app.get("/", (req, res) => res.send("API OK"));
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "Server is running smoothly" });
});

// Standardized Routes API
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/admin", require("./routes/auth.routes"));

// 404 Handler for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});