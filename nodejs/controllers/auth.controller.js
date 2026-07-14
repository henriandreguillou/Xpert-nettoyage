const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("LOGIN ATTEMPT:", email);

    const result = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
      [email]
    );

    const admin = result.rows[0];

    if (!admin) {
      console.log("ADMIN NOT FOUND");
      return res.status(401).json({
        message: "Email ou mot de passe invalide",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!isMatch) {
      console.log("PASSWORD WRONG");
      return res.status(401).json({
        message: "Email ou mot de passe invalide",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    console.log("LOGIN SUCCESS - TOKEN GENERATED");

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};


exports.updateAdmin = async (req, res) => {
  const id = req.user.id; // ✅ FIX IMPORTANT

  const { email, password, nom, prenom } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM admin WHERE id = $1",
      [id]
    );

    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({
        message: "Administrateur introuvable",
      });
    }

    let passwordHash = admin.password_hash;

    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await pool.query(
      `
      UPDATE admin
      SET 
        email = $1,
        password_hash = $2,
        nom = $3,
        prenom = $4
      WHERE id = $5
      RETURNING id, email, nom, prenom
      `,
      [
        email || admin.email,
        passwordHash,
        nom || admin.nom,
        prenom || admin.prenom,
        id,
      ]
    );

    return res.status(200).json({
      message: "Administrateur mis à jour avec succès",
      admin: updatedAdmin.rows[0],
    });

  } catch (err) {
    console.error("UPDATE ADMIN ERROR:", err);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const result = await pool.query(
      "SELECT id, email, nom, prenom FROM admin WHERE id = $1",
      [adminId]
    );

    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ message: "Admin introuvable" });
    }

    return res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getRendezvous = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        id,
        nom,
        prenom,
        email,
        phone,
        adresse,
        complement_adresse,
        code_postal,
        ville,
        type_client,
        societe,
        status,

        date_rdv::text AS date_rdv,

        heure_rdv::text AS heure_rdv

      FROM rendezvous

      ORDER BY date_rdv, heure_rdv
    `);


    console.log(result.rows[0]);


    return res.status(200).json(result.rows);


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Erreur récupération rendez-vous",
      error: error.message
    });

  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    console.log("REQ USER =", req.user);

    const adminId = req.user.id;

    const result = await pool.query(
      "SELECT id, email, nom, prenom FROM admin WHERE id = $1",
      [adminId]
    );

    return res.json(result.rows[0]);
  } catch (err) {
  console.error("GET ADMIN PROFILE ERROR =", err);
  return res.status(500).json({ message: "Erreur serveur" });
  }
};