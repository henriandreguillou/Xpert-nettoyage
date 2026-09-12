const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");
const multer = require("multer");

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

// 1. Créer une demande
router.post("/", upload.single("piece_jointe"), createRequest);

// 2. Récupérer toutes les demandes (Gère aussi le filtre status via query: /api/requests?status=...)
router.get("/", getAllRequests);

// 3. Récupérer les demandes par statut via sous-route (/api/requests/status/:status)
router.get("/status/:status", getRequestByStatus);

// 4. Récupérer une demande spécifique par son N° (Placé APRÈS les routes spécifiques pour éviter les conflits)
router.get("/:num_rq", verifyAdmin, getRequestByNum);

// 5. Supprimer une demande
router.delete("/:num_rq", verifyAdmin, deleteRequest);

module.exports = router;