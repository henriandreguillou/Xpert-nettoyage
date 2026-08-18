const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

// ======================
// DOSSIER UPLOADS
// ======================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Dossier uploads créé");
}

// ======================
// MIDDLEWARES
// ======================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ======================
// FICHIERS STATIQUES
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
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/appointment", appointmentRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/request", requestRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/admin", authRoutes);

// ======================
// DEMARRAGE SERVEUR
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur port ${PORT}`);
});