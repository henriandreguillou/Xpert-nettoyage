import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhone  } from "react-icons/fa";
import qrCode from "../assets/WhatsApp_QRcode.jpeg";
import logo from "../assets/logo.jpeg";
import "../style-css/footer.css";

export default function Footer() {
  const [showOverlay, setShowOverlay] = useState(false);

  const openOverlay = (e) => {
    e.preventDefault();
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          {/* Présentation */}
          <div className="footer-section">
            <Link to="/">
              <img
                src={logo}
                alt="XPERTNETTOYAGE"
                className="logo-image"
              />
            </Link>
        
          </div>

          {/* Liens rapides */}
          <div className="footer-section">
            <h3>Liens rapides</h3>
            <ul className="footer-links">
              <li>
                <Link className="nav-link" to="/">
                  Accueil
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/services">
                  Services
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/about">
                  À propos
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/tarifs">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
                  <h3>Contact</h3>

                  <p className="footer-line">
                    <FaMapMarkerAlt className="icon" />
                    <span>Haute-Savoie, France</span>
                  </p>

                  <p className="footer-line">
                    <FaEnvelope className="icon" />
                    <span>contact@xpert-nettoyage.fr</span>
                  </p>

                  <p className="footer-line">
                    <FaPhone className="icon" />
                    <span>+33 6 70 52 51 66</span>
                  </p>
                </div>

          {/* Réseaux sociaux */}
          <div className="footer-section">
            <h3>Suivez-nous</h3>

            <div className="footer-socials">

              <a
                href="https://www.facebook.com/xpertnettoyage74/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
              >
                <FaFacebookF />
                <span>Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/xpert_nettoyage/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
              >
                <FaInstagram />
                <span>Instagram</span>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                onClick={openOverlay}
                className="social-icon whatsapp"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>

            </div>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Xpertnettoyage - Tous droits réservés</p>
        </div>
      </footer>

      {/* OVERLAY WHATSAPP */}
      {showOverlay && (
        <div className="overlay" onClick={closeOverlay}>
          <div
            className="overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
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
    </>
  );
}