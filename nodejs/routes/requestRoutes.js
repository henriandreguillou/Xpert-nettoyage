const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const { createRequest,
        getAllRequests,
        getRequestByNum
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
// ROUTE
// =========================

router.post("/", upload.single("piece_jointe"), createRequest);
router.get("/", getAllRequests);
router.get("/:num_rq", getRequestByNum);

module.exports = router;