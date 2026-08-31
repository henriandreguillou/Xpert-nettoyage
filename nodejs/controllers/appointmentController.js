const pool = require('../config/db');
const { sendAppointmentEmail} = require('../config/mailer')

exports.createAppointment = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("BODY:", req.body);

    const {
      request_num_rq,
      date_rdv,
      heure_rdv,
      admin_id,
      description
    } = req.body;

    // 1. Validation des champs obligatoires
    if (!request_num_rq || !date_rdv || !heure_rdv || !admin_id) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires (request_num_rq, date_rdv, heure_rdv, admin_id)"
      });
    }

    const cleanRequestNum = request_num_rq.trim();

    // 2. Vérifier existence request
    const checkRequestQuery = `
      SELECT num_rq 
      FROM request 
      WHERE num_rq = $1
    `;
    const checkRequestResult = await client.query(checkRequestQuery, [cleanRequestNum]);

    if (checkRequestResult.rows.length === 0) {
      return res.status(404).json({
        message: `La demande '${request_num_rq}' n'existe pas.`
      });
    }

    // 3. Vérifier disponibilité créneau
    const checkSlotQuery = `
      SELECT id 
      FROM appointment
      WHERE date_appointment = $1 
      AND heure_appointment = $2
    `;
    const checkSlotResult = await client.query(checkSlotQuery, [date_rdv, heure_rdv]);

    if (checkSlotResult.rows.length > 0) {
      return res.status(400).json({
        message: "Ce créneau est déjà réservé"
      });
    }

    // --- DÉBUT DE LA TRANSACTION ---
    await client.query('BEGIN');

    // 4. INSERT dans appointment
    const insertAppointmentQuery = `
      INSERT INTO appointment (
        request_num_rq,
        admin_id,
        date_appointment,
        heure_appointment,
        status,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const appointmentValues = [
      cleanRequestNum,
      admin_id,
      date_rdv,
      heure_rdv,
      "programmé",
      description || null
    ];

    const insertResult = await client.query(insertAppointmentQuery, appointmentValues);
    const newAppointmentId = insertResult.rows[0].id;

    // 4b. Mettre à jour le statut de la demande
    const updateRequestStatusQuery = `
      UPDATE request
      SET status = 'programmé'
      WHERE num_rq = $1
    `;
    await client.query(updateRequestStatusQuery, [cleanRequestNum]);

    await client.query('COMMIT');
    // --- FIN DE LA TRANSACTION ---

    // 5. Récupération des données associées
    const selectJoinedQuery = `
      SELECT 
        a.id AS appointment_id,
        a.date_appointment,
        a.heure_appointment,
        a.description,
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
          'status', r.status,
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
    const createdAppointment = appointmentResult.rows[0];

    // ⚡ 6. ENVOI DE L'E-MAIL DE FAÇON ASYNCHRONE (Non-bloquant)
    // On libère la réponse HTTP immédiatement sans faire un `await` sur l'envoi de mail
    if (createdAppointment.request && createdAppointment.request.email) {
      const { email, nom, prenom, num_rq } = createdAppointment.request;
      const clientName = prenom ? `${prenom} ${nom}`.trim() : (nom || "");

      const formattedDate = new Date(date_rdv).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Exécution en tâche de fond
      sendAppointmentEmail({
        email: email,
        clientName: clientName,
        num_rq: num_rq,
        date_rdv: formattedDate,
        heure_rdv: heure_rdv,
        description: description,
        isEdit: false,
      })
      .then(() => console.log(`✉️ E-mail envoyé avec succès à ${email}`))
      .catch((emailErr) => console.error("⚠️ Erreur lors de l'envoi de l'e-mail :", emailErr.message));
    }

    // Réponse rapide au client React
    return res.status(201).json({
      message: "Rendez-vous créé avec succès",
      appointment: createdAppointment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("🔥 POSTGRES ERROR:", error);

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
    // S'assure de toujours libérer le client pour la piscine de connexions
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
        a.description,
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
    const { request_num_rq, date_rdv, heure_rdv, admin_id, status, description } = req.body;

    // --- DÉBUT DE LA TRANSACTION ---
    await client.query('BEGIN');

    // 1. Vérifier si le rendez-vous existe
    const checkApptQuery = `SELECT * FROM appointment WHERE id = $1 FOR UPDATE`;
    const checkApptResult = await client.query(checkApptQuery, [id]);

    if (checkApptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        message: `Le rendez-vous avec l'ID ${id} n'existe pas.`
      });
    }

    const oldAppointment = checkApptResult.rows[0];

    // Déterminer les valeurs finales
    const newRequestNum = request_num_rq ? request_num_rq.trim() : oldAppointment.request_num_rq;
    const newDate = date_rdv || oldAppointment.date_appointment;
    const newHeure = heure_rdv || oldAppointment.heure_appointment;
    const newAdminId = admin_id || oldAppointment.admin_id;
    const newStatus = status || oldAppointment.status;
    const newDescription = description !== undefined ? description : oldAppointment.description;

    // 2. Si la demande change, vérifier son existence
    if (request_num_rq) {
      const checkRequestQuery = `SELECT num_rq FROM request WHERE num_rq = $1`;
      const checkRequestResult = await client.query(checkRequestQuery, [newRequestNum]);

      if (checkRequestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          message: `La demande '${newRequestNum}' n'existe pas.`
        });
      }
    }

    // 3. Vérifier la disponibilité du créneau (si date ou heure change)
    if (newDate !== oldAppointment.date_appointment || newHeure !== oldAppointment.heure_appointment) {
      const checkSlotQuery = `
        SELECT id 
        FROM appointment
        WHERE date_appointment = $1 
        AND heure_appointment = $2
        AND id != $3
        AND status != 'annulé'
      `;
      const checkSlotResult = await client.query(checkSlotQuery, [newDate, newHeure, id]);

      if (checkSlotResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: "Ce créneau est déjà réservé par un autre rendez-vous."
        });
      }
    }

    // 4. Mettre à jour le rendez-vous (avec description)
    const updateQuery = `
      UPDATE appointment 
      SET request_num_rq = $1,
          admin_id = $2,
          date_appointment = $3,
          heure_appointment = $4,
          status = $5,
          description = $6
      WHERE id = $7
    `;

    await client.query(updateQuery, [
      newRequestNum,
      newAdminId,
      newDate,
      newHeure,
      newStatus,
      newDescription,
      id
    ]);

    // 5. Gestion des statuts de demande si changement de `request_num_rq`
    if (oldAppointment.request_num_rq !== newRequestNum) {
      const checkOldReqRemaining = `SELECT id FROM appointment WHERE request_num_rq = $1`;
      const remaining = await client.query(checkOldReqRemaining, [oldAppointment.request_num_rq]);
      
      if (remaining.rows.length === 0) {
        await client.query(`UPDATE request SET status = 'en attente' WHERE num_rq = $1`, [oldAppointment.request_num_rq]);
      }
      
      await client.query(`UPDATE request SET status = 'programmé' WHERE num_rq = $1`, [newRequestNum]);
    }

    // 6. Requête de jointure pour récupérer les données à jour
    const selectJoinedQuery = `
      SELECT 
        a.id AS appointment_id,
        a.date_appointment,
        a.heure_appointment,
        a.description,
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
    const updatedAppointment = updatedResult.rows[0];

    // Valider la transaction PostgreSQL avant les opérations secondaires (envoi de mail)
    await client.query('COMMIT');

    // 7. Envoi de l'e-mail de confirmation/modification (hors transaction DB)
    if (updatedAppointment.request && updatedAppointment.request.email) {
      const { email, nom, prenom, num_rq } = updatedAppointment.request;
      const clientName = prenom ? `${prenom} ${nom}`.trim() : (nom || "");

      // Découpage propre de la date YYYY-MM-DD sans décalage de fuseau horaire
      const dateParts = String(newDate).split('T')[0].split('-');
      const formattedDate = dateParts.length === 3 
        ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
        : newDate;

      try {
        await sendAppointmentEmail({
          email,
          clientName,
          num_rq,
          date_rdv: formattedDate,
          heure_rdv: newHeure,
          description: newDescription,
          isEdit: true,
        });
        console.log(`✉️ E-mail de mise à jour envoyé à ${email}`);
      } catch (emailErr) {
        console.error("⚠️ Erreur lors de l'envoi de l'e-mail :", emailErr.message);
      }
    }

    return res.status(200).json({
      message: "Rendez-vous mis à jour et e-mail envoyé avec succès",
      appointment: updatedAppointment
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

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const selectQuery = `
      SELECT 
        a.id AS appointment_id,
        a.date_appointment,
        a.heure_appointment,
        a.description,
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
          'status', r.status,
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

    const result = await pool.query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `Aucun rendez-vous trouvé avec l'ID ${id}`
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("🔥 POSTGRES ERROR (GET BY ID):", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération du rendez-vous",
      error: error.message
    });
  }
};