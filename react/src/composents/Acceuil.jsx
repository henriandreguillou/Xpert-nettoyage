import React, { useState, useEffect, useRef } from "react";
import backgroundImg from "../assets/acceuil.png";
import { Link, useLocation } from "react-router-dom";
import "../style-css/acceuil.css";
import {
  FaCouch,
  FaBed,
  FaBrush,
  FaChair
} from "react-icons/fa";

export default function Accueil() {
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Reset à chaque changement de page
  useEffect(() => {
    setOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  // click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () =>
      document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="accueil-container">

      {/* décor */}
      <div className="decor-vague-gauche"></div>
      <div className="decor-vague-bas"></div>

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

            <Link className="btn btn-secondary" to="/services">
              Nos Services
            </Link>

            {/* DROPDOWN RENDEZ-VOUS */}
            <div
              className="acceuil-dropdown-wrapper"
              ref={dropdownRef}
            >
              <button
                type="button"
                className="acceuil-dropdown-button"
                onClick={() => setOpen((prev) => !prev)}
              >
                prendre rendez-vous
                <span
                  className={`acceuil-dropdown-arrow ${
                    open ? "up" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {open && (
                <div className="acceuil-dropdown-menu">
                  <Link
                    className="acceuil-dropdown-item"
                    to="/request?type=particulier"
                    onClick={() => setOpen(false)}
                  >
                    Particulier
                  </Link>

                  <Link
                    className="acceuil-dropdown-item"
                    to="/request?type=entreprise"
                    onClick={() => setOpen(false)}
                  >
                    Entreprise
                  </Link>
                </div>
              )}
            </div>

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

          <div className="reassurance-item">
            🛡️ Résultat impeccable
          </div>

          <div className="reassurance-item">
            🕵️‍♂️ Intervention discrète
          </div>

          <div className="reassurance-item">
            🧪 Produits professionnels
          </div>

          <div className="reassurance-item">
            🎯 Service sur mesure
          </div>

        </div>
      </div>

    </div>
  );
}