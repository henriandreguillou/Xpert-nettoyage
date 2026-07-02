const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded); // 🔥 DEBUG IMPORTANT

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé (admin uniquement)" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
}

module.exports = verifyAdmin;