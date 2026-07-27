const pool = require('../config/db');


exports.createAppointment = async (req, res) => {
  // On récupère un client du pool pour gérer la transaction de manière sécurisée
  const client = await pool.connect();

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
      client.release();
      return res.status(400).json({
        message: "Tous les champs sont obligatoires (request_num_rq, date_rdv, heure_rdv, admin_id)"
      });
    }

    const cleanRequestNum = request_num_rq.trim();

    // 🔥 2. Vérifier existence request
    const checkRequestQuery = `
      SELECT num_rq 
      FROM request 
      WHERE num_rq = $1
    `;

    const checkRequestResult = await client.query(checkRequestQuery, [cleanRequestNum]);

    if (checkRequestResult.rows.length === 0) {
      client.release();
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

    const checkSlotResult = await client.query(checkSlotQuery, [date_rdv, heure_rdv]);

    if (checkSlotResult.rows.length > 0) {
      client.release();
      return res.status(400).json({
        message: "Ce créneau est déjà réservé"
      });
    }

    // --- DEBUT DE LA TRANSACTION ---
    await client.query('BEGIN');

    // 🔥 4. INSERT avec status = "programmé" dans appointment
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
      cleanRequestNum,
      admin_id,
      date_rdv,
      heure_rdv,
      "programmé"
    ];

    const insertResult = await client.query(insertAppointmentQuery, appointmentValues);
    const newAppointmentId = insertResult.rows[0].id;

    // 🔥 NOUVEAU - 4b. Mettre à jour le statut dans la table request en "programmé"
    const updateRequestStatusQuery = `
      UPDATE request
      SET status = 'programmé'
      WHERE num_rq = $1
    `;
    
    await client.query(updateRequestStatusQuery, [cleanRequestNum]);

    // On valide les changements dans la base de données
    await client.query('COMMIT');
    // ---------------------------------

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
          'status', r.status, -- Ajouté pour voir le nouveau statut de la requête
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

    const appointmentResult = await client.query(selectJoinedQuery, [newAppointmentId]);

    return res.status(201).json({
      message: "Rendez-vous créé et demande mise à jour avec succès",
      appointment: appointmentResult.rows[0]
    });

  } catch (error) {
    // En cas d'erreur, on annule tout ce qui a été fait dans la transaction
    await client.query('ROLLBACK');
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
  } finally {
    // Très important : on libère toujours le client pour le remettre dans le pool
    client.release();
  }
};


exports.getTakenHoursByDate = async (req, res) => {
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

exports.getAppointmentsForCalendar = async (req, res) => {
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

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    const { request_num_rq, date_rdv, heure_rdv, admin_id, status } = req.body;

    // 🔥 1. Vérifier si le rendez-vous existe
    const checkApptQuery = `SELECT * FROM appointment WHERE id = $1`;
    const checkApptResult = await client.query(checkApptQuery, [id]);

    if (checkApptResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        message: `Le rendez-vous avec l'ID ${id} n'existe pas.`
      });
    }

    const oldAppointment = checkApptResult.rows[0];
    const newRequestNum = request_num_rq ? request_num_rq.trim() : oldAppointment.request_num_rq;
    const newDate = date_rdv || oldAppointment.date_appointment;
    const newHeure = heure_rdv || oldAppointment.heure_appointment;
    const newAdminId = admin_id || oldAppointment.admin_id;
    const newStatus = status || oldAppointment.status;

    // 🔥 2. Si la demande change, vérifier qu'elle existe
    if (request_num_rq) {
      const checkRequestQuery = `SELECT num_rq FROM request WHERE num_rq = $1`;
      const checkRequestResult = await client.query(checkRequestQuery, [newRequestNum]);
      if (checkRequestResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          message: `La demande '${newRequestNum}' n'existe pas.`
        });
      }
    }

    // 🔥 3. Vérifier la disponibilité du créneau (si la date ou l'heure change)
    if (newDate !== oldAppointment.date_appointment || newHeure !== oldAppointment.heure_appointment) {
      const checkSlotQuery = `
        SELECT id 
        FROM appointment
        WHERE date_appointment = $1 
        AND heure_appointment = $2
        AND id != $3
      `;
      const checkSlotResult = await client.query(checkSlotQuery, [newDate, newHeure, id]);

      if (checkSlotResult.rows.length > 0) {
        client.release();
        return res.status(400).json({
          message: "Ce créneau est déjà réservé par un autre rendez-vous."
        });
      }
    }

    // --- DÉBUT DE LA TRANSACTION ---
    await client.query('BEGIN');

    // 🔥 4. UPDATE du rendez-vous
    const updateQuery = `
      UPDATE appointment 
      SET request_num_rq = $1,
          admin_id = $2,
          date_appointment = $3,
          heure_appointment = $4,
          status = $5
      WHERE id = $6
    `;

    await client.query(updateQuery, [
      newRequestNum,
      newAdminId,
      newDate,
      newHeure,
      newStatus,
      id
    ]);

    // 🔥 5. Si l'ancienne demande était différente et qu'elle n'a plus d'autres RDV, 
    // on peut optionnellement remettre son statut à "en attente" (selon votre logique métier)
    if (oldAppointment.request_num_rq !== newRequestNum) {
      const checkOldReqRemaining = `SELECT id FROM appointment WHERE request_num_rq = $1`;
      const remaining = await client.query(checkOldReqRemaining, [oldAppointment.request_num_rq]);
      
      if (remaining.rows.length === 0) {
        await client.query(`UPDATE request SET status = 'en attente' WHERE num_rq = $1`, [oldAppointment.request_num_rq]);
      }
      
      // Mettre le nouveau à "programmé"
      await client.query(`UPDATE request SET status = 'programmé' WHERE num_rq = $1`, [newRequestNum]);
    }

    await client.query('COMMIT');
    // ---------------------------------

    // 🔥 6. Requête de jointure pour le retour (similaire au create)
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
          'status', r.status
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

    const updatedResult = await client.query(selectJoinedQuery, [id]);

    return res.status(200).json({
      message: "Rendez-vous mis à jour avec succès",
      appointment: updatedResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("🔥 POSTGRES ERROR (UPDATE):", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour du rendez-vous",
      error: error.message
    });
  } finally {
    client.release();
  }
};


exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    // 🔥 1. Vérifier si le rendez-vous existe et récupérer son request_num_rq
    const checkApptQuery = `SELECT * FROM appointment WHERE id = $1`;
    const checkApptResult = await client.query(checkApptQuery, [id]);

    if (checkApptResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        message: `Le rendez-vous avec l'ID ${id} n'existe pas.`
      });
    }

    const appointment = checkApptResult.rows[0];
    const requestNumRq = appointment.request_num_rq;

    // --- DÉBUT DE LA TRANSACTION ---
    await client.query('BEGIN');

    // 🔥 2. Supprimer le rendez-vous
    const deleteQuery = `DELETE FROM appointment WHERE id = $1`;
    await client.query(deleteQuery, [id]);

    // 🔥 3. Mettre à jour le statut de la request associée (ex: repasser en "en attente")
    if (requestNumRq) {
      const updateRequestQuery = `
        UPDATE request 
        SET status = 'en attente' 
        WHERE num_rq = $1
      `;
      await client.query(updateRequestQuery, [requestNumRq]);
    }

    await client.query('COMMIT');
    // ---------------------------------

    return res.status(200).json({
      message: "Rendez-vous supprimé avec succès et demande remise en attente",
      idDeleted: id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("🔥 POSTGRES ERROR (DELETE):", error);
    return res.status(500).json({
      message: "Erreur lors de la suppression du rendez-vous",
      error: error.message
    });
  } finally {
    client.release();
  }
};