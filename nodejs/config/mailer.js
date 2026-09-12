const nodemailer = require('nodemailer');
const path = require('path');

// Chargement fallback pour le dev local
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const emailHost = process.env.EMAIL_HOST || "smtp.hostinger.com";
const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 465;
const isSecure = emailPort === 465;

// Logs de contrôle au chargement
console.log("🔍 Verification des variables SMTP :");
console.log("  - EMAIL_HOST :", emailHost);
console.log("  - EMAIL_PORT :", emailPort, `(secure: ${isSecure})`);
console.log("  - EMAIL_USER :", process.env.EMAIL_USER ? "✅ Présent" : "❌ ABSENT");
console.log("  - EMAIL_PASS :", process.env.EMAIL_PASS ? "✅ Présent" : "❌ ABSENT");

// Configuration Nodemailer adaptée à Hostinger (Port 465 / SSL)
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: isSecure, // true pour le port 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "",
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "",
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log("⏳ Test de connexion au serveur SMTP Hostinger en cours...");

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur de connexion SMTP Hostinger :", error.message);
  } else {
    console.log("✅ Connecté au serveur SMTP Hostinger avec succès !");
  }
});

/**
 * Envoie un e-mail de confirmation de demande d'estimation
 */
const sendConfirmationEmail = async (data) => {
  const { num_rq, email, nom, prenom, type_client, phone, adresse, ville, code_postal } = data;

  if (!process.env.EMAIL_USER) {
    throw new Error("Variable EMAIL_USER manquante dans l'environnement");
  }

  const clientName = type_client === "entreprise" ? nom : `${prenom || ""} ${nom}`.trim();

  const mailOptions = {
    from: `"Xpert Nettoyage" <${process.env.EMAIL_USER.trim()}>`,
    to: email,
    subject: `Confirmation de votre demande N° ${num_rq}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a365d; margin-bottom: 5px;">Bonjour ${clientName},</h2>
        <p style="font-size: 14px; color: #718096; margin-top: 0;">Demande d'estimation N° <strong>${num_rq}</strong></p>
        
        <p>Nous avons bien reçu votre demande et nous vous en remercions.</p>
        <p>Notre équipe étudie votre dossier et vous recontactera dans les plus brefs délais.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <h3 style="color: #2d3748; font-size: 16px;">Récapitulatif de votre demande :</h3>
        <ul style="list-style: none; padding-left: 0; color: #4a5568;">
          <li style="margin-bottom: 8px;">📞 <strong>Téléphone :</strong> ${phone}</li>
          <li style="margin-bottom: 8px;">📍 <strong>Adresse :</strong> ${adresse}, ${code_postal} ${ville}</li>
        </ul>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #a0aec0;">
          <p>Cordialement,<br><strong>L'équipe Xpert Nettoyage</strong></p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Envoie un e-mail de rendez-vous
 */
const sendAppointmentEmail = async (data) => {
  const { email, clientName, num_rq, date_rdv, heure_rdv, isEdit = false } = data;

  if (!process.env.EMAIL_USER) {
    throw new Error("Variable EMAIL_USER manquante dans l'environnement");
  }

  const subject = isEdit
    ? `Modification de votre rendez-vous (Demande ${num_rq})`
    : `Confirmation de votre rendez-vous (Demande ${num_rq})`;

  const mailOptions = {
    from: `"Xpert Nettoyage" <${process.env.EMAIL_USER.trim()}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a365d; margin-bottom: 5px;">Bonjour ${clientName || ""},</h2>
        <p style="font-size: 14px; color: #718096; margin-top: 0;">Demande N° <strong>${num_rq}</strong></p>
        
        <p>Votre rendez-vous pour l'intervention a été ${isEdit ? "mis à jour" : "programmé"}.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <h3 style="color: #2d3748; font-size: 16px;">Détails du rendez-vous :</h3>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3182ce;">
          <p style="margin: 0 0 8px 0; color: #2d3748;">📅 <strong>Date :</strong> ${date_rdv}</p>
          <p style="margin: 0; color: #2d3748;">⏰ <strong>Heure :</strong> ${heure_rdv}</p>
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #4a5568;">
          En cas d'imprévu, merci de nous contacter au plus vite.
        </p>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #a0aec0;">
          <p>Cordialement,<br><strong>L'équipe Xpert Nettoyage</strong></p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendConfirmationEmail,
  sendAppointmentEmail,
};