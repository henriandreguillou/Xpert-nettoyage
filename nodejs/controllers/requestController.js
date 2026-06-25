const pool = require("../config/db");

const generateCodeRQ = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

const createRequest = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      type_client,
      nom,
      prenom,
      email,
      phone,
      adresse,
      ville,
      code_postal,
      complement_adresse
    } = req.body;

    const piece_jointe = req.file ? req.file.filename : null;

    if (
      !type_client ||
      !nom ||
      !email ||
      !phone ||
      !adresse ||
      !ville ||
      !code_postal
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis"
      });
    }

    if (type_client === "particulier" && !prenom) {
      return res.status(400).json({
        message: "Le prénom est obligatoire pour un particulier"
      });
    }

    // 🔥 CODE UNIQUE num_rq
    let num_rq;
    let exists = true;

    while (exists) {
      num_rq = generateCodeRQ();

      const check = await pool.query(
        "SELECT id FROM request WHERE num_rq = $1",
        [num_rq]
      );

      exists = check.rows.length > 0;
    }

    const query = `
      INSERT INTO request (
        num_rq,
        type_client,
        nom,
        prenom,
        email,
        phone,
        adresse,
        ville,
        code_postal,
        complement_adresse,
        piece_jointe
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;

    const values = [
      num_rq,
      type_client.trim(),
      nom.trim(),
      type_client === "particulier" ? prenom?.trim() : null,
      email.trim().toLowerCase(),
      phone.trim(),
      adresse.trim(),
      ville.trim(),
      code_postal.trim(),
      complement_adresse?.trim() || null,
      piece_jointe
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Request créée avec succès",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

module.exports = {
  createRequest
};