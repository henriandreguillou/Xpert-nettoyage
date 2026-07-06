const pool = require('../config/db');





/////////////////////////
//// ** POST ** ////
////////////////////////

const createAppointment = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      request_num_rq,
      date_rdv,
      heure_rdv,
      admin_id
    } = req.body;

    // 🔥 1. Validation champs obligatoires
    if (!request_num_rq || !date_rdv || !heure_rdv || !admin_id) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires (request_num_rq, date_rdv, heure_rdv, admin_id)"
      });
    }

    // 🔥 2. Vérifier existence request
    const checkRequestQuery = `
      SELECT num_rq 
      FROM request 
      WHERE num_rq = $1
    `;

    const checkRequestResult = await pool.query(checkRequestQuery, [
      request_num_rq.trim()
    ]);

    if (checkRequestResult.rows.length === 0) {
      return res.status(404).json({
        message: `La demande '${request_num_rq}' n'existe pas.`
      });
    }

    // 🔥 3. Vérifier disponibilité créneau
    const checkSlotQuery = `
      SELECT id 
      FROM appointment
      WHERE date_appointment = $1 
      AND heure_appointment = $2
    `;

    const checkSlotResult = await pool.query(checkSlotQuery, [
      date_rdv,
      heure_rdv
    ]);

    if (checkSlotResult.rows.length > 0) {
      return res.status(400).json({
        message: "Ce créneau est déjà réservé"
      });
    }

    // 🔥 4. INSERT avec status = "programmé"
    const insertAppointmentQuery = `
      INSERT INTO appointment (
        request_num_rq,
        admin_id,
        date_appointment,
        heure_appointment,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const appointmentValues = [
      request_num_rq.trim(),
      admin_id,
      date_rdv,
      heure_rdv,
      "programmé"
    ];

    const insertResult = await pool.query(
      insertAppointmentQuery,
      appointmentValues
    );

    const newAppointmentId = insertResult.rows[0].id;

    // 🔥 5. JOIN pour retour complet
    const selectJoinedQuery = `
      SELECT 
        a.id AS appointment_id,
        a.date_appointment,
        a.heure_appointment,
        a.status AS appointment_status,
        a.created_at AS appointment_created_at,

        json_build_object(
          'id', r.id,
          'num_rq', r.num_rq,
          'nom', r.nom,
          'prenom', r.prenom,
          'email', r.email,
          'phone', r.phone,
          'adresse', r.adresse,
          'ville', r.ville,
          'code_postal', r.code_postal,
          'complement_adresse', r.complement_adresse,
          'piece_jointe', r.piece_jointe,
          'created_at', r.created_at
        ) AS request,

        json_build_object(
          'id', adm.id,
          'nom', adm.nom,
          'prenom', adm.prenom,
          'email', adm.email
        ) AS admin

      FROM appointment a
      LEFT JOIN request r ON a.request_num_rq = r.num_rq
      LEFT JOIN admin adm ON a.admin_id = adm.id
      WHERE a.id = $1
    `;

    const appointmentResult = await pool.query(selectJoinedQuery, [
      newAppointmentId
    ]);

    return res.status(201).json({
      message: "Rendez-vous créé avec succès",
      appointment: appointmentResult.rows[0]
    });

  } catch (error) {
    console.error("🔥 POSTGRES ERROR:", error);

    // FK admin error
    if (error.code === "23503" && error.constraint === "fk_admin") {
      return res.status(404).json({
        message: "L'administrateur n'existe pas."
      });
    }

    return res.status(500).json({
      message: "Erreur lors de la création du rendez-vous",
      error: error.message
    });
  }
};
/////////////////////////
//// ** UPDATE ** ////
////////////////////////



/////////////////////////
//// ** DELETE ** ////
////////////////////////



/////////////////////////
//// ** GET BY DATE ** ////
////////////////////////

const getTakenHoursByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        message: "La date est obligatoire."
      });
    }

    const query = `
      SELECT
        id,
        heure_appointment,
        status
      FROM appointment
      WHERE date_appointment = $1
      ORDER BY heure_appointment ASC
    `;

    const result = await pool.query(query, [date]);

    return res.status(200).json({
      date,
      takenHours: result.rows
    });

  } catch (error) {
    console.error("🔥 POSTGRES ERROR:", error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des créneaux.",
      error: error.message
    });
  }
};

const getAppointmentsForCalendar = async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.date_appointment AS date_rdv,
        a.heure_appointment AS heure_rdv,
        a.status,

        r.num_rq,
        r.nom,
        r.prenom,
        r.email,
        r.phone,
        r.adresse,
        r.complement_adresse,
        r.code_postal,
        r.ville

      FROM appointment a
      INNER JOIN request r
        ON a.request_num_rq = r.num_rq

      ORDER BY
        a.date_appointment ASC,
        a.heure_appointment ASC;
    `;

    const result = await pool.query(query);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des rendez-vous.",
      error: error.message
    });
  }
};


module.exports = {
  createAppointment,
  getTakenHoursByDate,
  getAppointmentsForCalendar
};




