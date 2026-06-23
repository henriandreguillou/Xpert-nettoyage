const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");

const {
  loginAdmin,
  updateAdmin,
  getAdminProfile,
  getRendezvous
} = require("../controllers/auth.controller");

// 🔐 Auth
router.post("/login", loginAdmin);

// 👤 Profil admin (nom + prénom)
router.get("/me", verifyAdmin, getAdminProfile);

// ✏️ Update admin
router.put("/:id", verifyAdmin, updateAdmin);

// 📅 Planning
router.get("/calendar", verifyAdmin, getRendezvous);

module.exports = router;

