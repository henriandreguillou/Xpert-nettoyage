const nodemailer = require('nodemailer');
const path = require('path');

// Chargement sécurisé du .env depuis la racine du projet
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Configuration SMTP optimisée (Port 587 STARTTLS)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // TLS
  pool: true,    // ⚡ GARDE LA CONNEXION OUVERTE (gain de temps majeur)
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Envoie un e-mail de confirmation de demande d'estimation au client
 * @param {Object} data - Données du formulaire et numéro de demande
 */
const sendConfirmationEmail = async (data) => {
  const { num_rq, email, nom, prenom, type_client, phone, adresse, ville, code_postal } = data;

  const clientName = type_client === "entreprise" ? nom : `${prenom || ""} ${nom}`.trim();

  const mailOptions = {
    from: `"Xpert Nettoyage" <${process.env.EMAIL_USER}>`,
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
 * Envoie un e-mail de confirmation ou de modification de rendez-vous au client
 * @param {Object} data - Données du rendez-vous
 */
const sendAppointmentEmail = async (data) => {
  const { email, clientName, num_rq, date_rdv, heure_rdv, isEdit = false } = data;

  const subject = isEdit
    ? `Modification de votre rendez-vous (Demande ${num_rq})`
    : `Confirmation de votre rendez-vous (Demande ${num_rq})`;

  const mailOptions = {
    from: `"Xpert Nettoyage" <${process.env.EMAIL_USER}>`,
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