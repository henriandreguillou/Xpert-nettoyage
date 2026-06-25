import { useState } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";

import qrCode from "../assets/WhatsApp_QRcode.jpeg";
import "../style-css/contact.css";

export default function Contact() {
  const [showOverlay, setShowOverlay] = useState(false);

  const openOverlay = (e) => {
    e.preventDefault();
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        <h1>Contactez-nous</h1>

        <p>
          Besoin d'un devis ou d'informations sur nos services de nettoyage ?
        </p>

        {/* CONTACT INFO PRO */}
        <div className="contact-info">

          <p className="contact-line">
            <FaEnvelope className="icon" />
            <span>contact@xpert-nettoyage.fr</span>
          </p>

          <p className="contact-line">
            <FaPhone className="icon" />
            <span>+33 6 70 52 51 66</span>
          </p>

        </div>

        {/* WHATSAPP */}
        <div className="socials">
          <a
            href="#"
            onClick={openOverlay}
            className="social-icon whatsapp"
          >
            <FaWhatsapp className="icon" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* OVERLAY */}
      {showOverlay && (
        <div className="overlay" onClick={closeOverlay}>
          <div
            className="overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Contact WhatsApp</h2>

            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              className="qr-image"
            />

            <div className="overlay-buttons">
              <a
                href="https://api.whatsapp.com/message/7WA5GXD2TY7SD1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="btn confirm"
              >
                Ouvrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}