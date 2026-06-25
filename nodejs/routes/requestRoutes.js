const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const { createRequest } = require("../controllers/requestController");

// =========================
// CONFIG MULTER
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// =========================
// ROUTE
// =========================

// POST /request
router.post("/", upload.single("piece_jointe"), createRequest);

module.exports = router;