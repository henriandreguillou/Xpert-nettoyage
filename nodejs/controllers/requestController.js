const pool = require("../config/db");

const generateCodeRQ = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

exports.createRequest = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
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

    // Génération d'un numéro de demande unique
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const values = [
      num_rq,
      nom.trim(),
      prenom?.trim() || null,
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


exports.getAllRequests = async (req, res) => {
    try {
        // MODIFIE LA REQUÊTE ICI AVEC LE LEFT JOIN
        const query = `
          SELECT 
            r.*, 
            a.date_appointment, 
            a.heure_appointment
          FROM request r
          LEFT JOIN appointment a ON r.num_rq = a.request_num_rq
          ORDER BY r.created_at DESC;
        `;

        const result = await pool.query(query);

        return res.status(200).json({
          data: result.rows
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
      }
};

exports.getRequestByNum = async (req, res) => {
  try {
    const { num_rq } = req.params;

    const result = await pool.query(
      "SELECT * FROM request WHERE num_rq = $1",
      [num_rq]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Request introuvable"
      });
    }

    return res.status(200).json({
      message: "Request trouvée",
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

exports.deleteRequest = async (req, res) => {
  try {
    const { num_rq } = req.params;

    if (!num_rq) {
      return res.status(400).json({
        message: "Le numéro de demande est requis"
      });
    }

    // Vérifie si la demande existe
    const check = await pool.query(
      "SELECT * FROM request WHERE num_rq = $1",
      [num_rq]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "Demande introuvable"
      });
    }

    // Suppression
    await pool.query(
      "DELETE FROM request WHERE num_rq = $1",
      [num_rq]
    );

    return res.status(200).json({
      message: "Demande supprimée avec succès"
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

exports.getRequestByStatus = async (req, res) => {
  try {
    // decodeURIComponent permet de transformer "en%20attente" en "en attente"
    const status = decodeURIComponent(req.params.status).trim();

    if (!status) {
      return res.status(400).json({ message: "Le paramètre statut est obligatoire." });
    }

    // On utilise ILIKE à la place de = pour ignorer les majuscules/minuscules
    const query = `
      SELECT 
        r.*, 
        a.date_appointment, 
        a.heure_appointment
      FROM request r
      LEFT JOIN appointment a ON r.num_rq = a.request_num_rq
      WHERE r.status = $1
      ORDER BY r.created_at DESC;
    `;

    const result = await pool.query(query, [status]);

    return res.status(200).json({
      message: `Liste des demandes avec le statut '${status}'`,
      data: result.rows // Vérifie bien que c'est result.rows et pas autre chose
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



