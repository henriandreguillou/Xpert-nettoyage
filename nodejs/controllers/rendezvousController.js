const pool = require('../config/db');




const generateCodeRDV = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};


/////////////////////////
//// ** GET ** ////
////////////////////////

const getRendezvousByNum = async (req, res) => {
  try {
    const { num_rdv } = req.params;

    if (!num_rdv) {
      return res.status(400).json({
        message: "Le numéro de rendez-vous est requis"
      });
    }

    const query = `
      SELECT *
      FROM rendezvous
      WHERE num_rdv = $1
    `;

    const result = await pool.query(query, [num_rdv]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    return res.status(200).json({
      message: "Rendez-vous trouvé",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("🔥 POSTGRES ERROR:", error);

    return res.status(500).json({
      message: "Erreur récupération rendez-vous",
      error: error.message
    });
  }
};

/////////////////////////
//// ** POST ** ////
////////////////////////

const createRendezvous = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      type_client,
      nom,
      prenom,
      email,
      phone,
      date_rdv,
      heure_rdv,
      adresse,
      ville,
      code_postal,
      complement_adresse
    } = req.body;

    // 🔥 validation sécurisée (trim safe)
    if (
      !type_client ||
      !nom ||
      !email ||
      !phone ||
      !date_rdv ||
      !heure_rdv ||
      !adresse ||
      !ville ||
      !code_postal
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis"
      });
    }

    // 🔥 règle métier propre selon type
    if (type_client === "particulier" && !prenom) {
      return res.status(400).json({
        message: "Le prénom est obligatoire pour un particulier"
      });
    }

    // Vérifier créneau
    const checkQuery = `
      SELECT * FROM rendezvous
      WHERE date_rdv = $1 AND heure_rdv = $2
    `;

    const checkResult = await pool.query(checkQuery, [
      date_rdv,
      heure_rdv
    ]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: "Ce créneau est déjà réservé"
      });
    }

    const num_rdv = generateCodeRDV();

    // INSERT
    const query = `
      INSERT INTO rendezvous (
        num_rdv,
        type_client,
        nom,
        prenom,
        email,
        phone,
        date_rdv,
        heure_rdv,
        adresse,
        ville,
        code_postal,
        complement_adresse
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;

    const values = [
      num_rdv,
      type_client?.trim(),
      nom?.trim(),
      type_client === "particulier" ? prenom?.trim() : null,
      email?.trim().toLowerCase(),
      phone?.trim(),
      date_rdv,
      heure_rdv,
      adresse?.trim(),
      ville?.trim(),
      code_postal?.trim(),
      complement_adresse?.trim() || null
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Rendez-vous créé avec succès",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("🔥 POSTGRES ERROR:", error);

    return res.status(500).json({
      message: "Erreur lors de la création du rendez-vous",
      error: error.message
    });
  }
};
/////////////////////////
//// ** UPDATE ** ////
////////////////////////

const updateRendezvousByNum = async (req, res) => {
  try {
    const { num_rdv } = req.params;

    const {
      nom,
      prenom,
      email,
      phone,
      date_rdv,
      heure_rdv,
      adresse,
      ville,
      code_postal,
      complement_adresse
    } = req.body;

    // Vérifier si le RDV existe
    const checkQuery = `SELECT * FROM rendezvous WHERE num_rdv = $1`;
    const checkResult = await pool.query(checkQuery, [num_rdv]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    // Update
    const updateQuery = `
      UPDATE rendezvous
      SET
        nom = COALESCE($1, nom),
        prenom = COALESCE($2, prenom),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        date_rdv = COALESCE($5, date_rdv),
        heure_rdv = COALESCE($6, heure_rdv),
        adresse = COALESCE($7, adresse),
        ville = COALESCE($8, ville),
        code_postal = COALESCE($9, code_postal),
        complement_adresse = COALESCE($10, complement_adresse)
      WHERE num_rdv = $11
      RETURNING *
    `;

    const values = [
      nom ? nom.trim() : null,
      prenom ? prenom.trim() : null,
      email ? email.trim().toLowerCase() : null,
      phone ? phone.trim() : null,
      date_rdv || null,
      heure_rdv || null,
      adresse ? adresse.trim() : null,
      ville ? ville.trim() : null,
      code_postal ? code_postal.trim() : null,
      complement_adresse ? complement_adresse.trim() : null,
      num_rdv
    ];

    const result = await pool.query(updateQuery, values);

    return res.status(200).json({
      message: "Rendez-vous mis à jour avec succès",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("🔥 UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Erreur lors de la mise à jour du rendez-vous",
      error: error.message
    });
  }
};


/////////////////////////
//// ** DELETE ** ////
////////////////////////

const deleteRendezvousByNum = async (req, res) => {
  try {
    const { num_rdv } = req.params;

    // Vérifier si le rendez-vous existe
    const checkQuery = `SELECT * FROM rendezvous WHERE num_rdv = $1`;
    const checkResult = await pool.query(checkQuery, [num_rdv]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    // Suppression
    const deleteQuery = `
      DELETE FROM rendezvous
      WHERE num_rdv = $1
      RETURNING *
    `;

    const result = await pool.query(deleteQuery, [num_rdv]);

    return res.status(200).json({
      message: "Rendez-vous supprimé avec succès",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("🔥 DELETE ERROR:", error);

    return res.status(500).json({
      message: "Erreur lors de la suppression du rendez-vous",
      error: error.message
    });
  }
};


/////////////////////////
//// ** GET BY DATE ** ////
////////////////////////

const getTakenHoursByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Validation simple
    if (!date) {
      return res.status(400).json({
        message: "Date manquante"
      });
    }

    // 🔥 Récupérer les heures déjà prises
    const query = `
      SELECT heure_rdv
      FROM rendezvous
      WHERE date_rdv = $1
    `;

    const result = await pool.query(query, [date]);

    // 🔥 format propre des heures (08:00)
    const takenHours = result.rows.map((row) =>
      row.heure_rdv.slice(0, 5)
    );

    return res.status(200).json({
      message: "Heures récupérées avec succès",
      data: takenHours
    });

  } catch (error) {
    console.error("🔥 POSTGRES ERROR:", error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des heures",
      error: error.message
    });
  }
};


module.exports = {
  generateCodeRDV,
  getRendezvousByNum,
  createRendezvous,
  updateRendezvousByNum,
  deleteRendezvousByNum,
  getTakenHoursByDate
};




