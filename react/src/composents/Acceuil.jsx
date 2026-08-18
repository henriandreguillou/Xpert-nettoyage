import React, { useState, useEffect } from "react";
import image1 from "../assets/1.png";
import image2 from "../assets/2.png";
import { Link, useLocation } from "react-router-dom";
import "../style-css/acceuil.css";
import {
  FaCouch,
  FaBed,
  FaBrush,
  FaChair
} from "react-icons/fa";

export default function Accueil() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // reset menu à chaque navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // ESC pour fermer menu burger
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="accueil-container">



      {/* HERO */}
      <div className="hero-section">
        <div className="hero-content">

          <h1 className="hero-title">
            Entretien & hygiène <br />
            <span className="italic-light">
              des textiles d'ameublement
            </span>
          </h1>

          <p className="hero-description">
            Au service des chalets, hôtels, résidences, conciergeries et particuliers.
          </p>

          <div className="button-group">
            <Link className="btn-acceuil btn-services" to="/services">
              Nos Services
            </Link>

            <Link className="btn-acceuil btn-rdv" to="/request">
              Prendre rendez-vous
            </Link>
          </div>

        </div>
      </div>

      {/* SERVICES */}
      <div className="services-section">
        <div className="services-grid">

          <div className="service-item">
            <FaCouch className="service-icon" />
            <h3 className="service-title">Canapés & Fauteuils</h3>
            <p className="service-desc">Nettoyage en profondeur</p>
          </div>

          <div className="service-item">
            <FaBed className="service-icon" />
            <h3 className="service-title">Matelas & Tête de lit</h3>
            <p className="service-desc">Hygiène & désinfection</p>
          </div>

          <div className="service-item">
            <FaBrush className="service-icon" />
            <h3 className="service-title">Tapis & Moquettes</h3>
            <p className="service-desc">Soin des fibres</p>
          </div>

          <div className="service-item">
            <FaChair className="service-icon" />
            <h3 className="service-title">Chaises & Sièges</h3>
            <p className="service-desc">Résultat impeccable</p>
          </div>

        </div>
      </div>

      {/* REASSURANCE */}
      <div className="reassurance-bar">
        <div className="reassurance-content">

          <div className="reassurance-item">🛡️ Résultat impeccable</div>
          <div className="reassurance-item">🕵️‍♂️ Intervention discrète</div>
          <div className="reassurance-item">🧪 Produits professionnels</div>
          <div className="reassurance-item">🎯 Service sur mesure</div>

        </div>
      </div>

      {/* IMAGES EN BAS */}
      <div className="bottom-images">
        <img
          src={image1}
          alt="Illustration 1"
          className="bottom-image"
        />

        <img
          src={image2}
          alt="Illustration 2"
          className="bottom-image"
        />
      </div>

    </div>
  );
}