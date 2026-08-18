const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");

const {
  createRequest,
  getAllRequests,
  getRequestByNum,
  deleteRequest,
  getRequestByStatus
} = require("../controllers/requestController");

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
// ROUTES
// =========================
router.post("/", upload.single("piece_jointe"), createRequest);
router.get("/page", getAllRequests);
router.get("/:num_rq", verifyAdmin, getRequestByNum);
router.delete("/:num_rq", deleteRequest);
router.get("/status/:status", getRequestByStatus);

module.exports = router;