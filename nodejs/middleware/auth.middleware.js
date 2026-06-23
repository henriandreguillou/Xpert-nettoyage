const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Format token invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Token invalide" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    req.user = decoded; // 🔥 FIX IMPORTANT
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
}

module.exports = verifyAdmin;