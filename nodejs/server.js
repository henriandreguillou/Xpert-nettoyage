const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

// ======================
// CREATE UPLOADS FOLDER SAFE
// ======================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 uploads folder created");
}

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// STATIC FILES
// ======================
app.use("/uploads", express.static(uploadDir));

// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("API OK");
});

// ======================
// ROUTES
// ======================
const rendezvousRoutes = require("./routes/rendezvousRoutes");
app.use("/rendezvous", rendezvousRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/request", requestRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/admin", authRoutes);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur port ${PORT}`);
});