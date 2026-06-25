import React from 'react';
import backgroundImg from '../assets/acceuil.png';
import { Link } from "react-router-dom";
import "../style-css/acceuil.css"
import {
  FaCouch,
  FaBed,
  FaBrush,
  FaChair
} from "react-icons/fa";

export default function Accueil() {
  return (
    <div
      className="accueil-container"
    >
      {/* Formes décoratives jaunes sur les contours */}
      <div className="decor-vague-gauche"></div>
      <div className="decor-vague-bas"></div>

      {/* --- SECTION PRINCIPALE (HERO) --- */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Entretien & hygiène <br />
            <span className="italic-light"> des textiles d'ameublement</span>
          </h1>
          
          <p className="hero-description">
            Au service des chalets, hôtels, résidences, conciergeries et particuliers.
          </p>

          <div className="button-group">
            <Link className=" btn btn-secondary" to="/services">Nos Services</Link>
            <button className="btn btn-primary">Obtenier une estimation</button>
          </div>
        </div>
      </div>

      {/* --- SECTION DES SERVICES (4 COLONNES) --- */}
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

      {/* --- BARRE DE RÉASSURANCE DU BAS --- */}
      <div className="reassurance-bar">
        <div className="reassurance-content">
          <div className="reassurance-item">
            <span>🛡️</span> <span>Résultat impeccable</span>
          </div>
          <div className="reassurance-item">
            <span>🕵️‍♂️</span> <span>Intervention discrète</span>
          </div>
          <div className="reassurance-item">
            <span>🧪</span> <span>Produits professionnels</span>
          </div>
          <div className="reassurance-item">
            <span>🎯</span> <span>Service sur mesure</span>
          </div>
        </div>
      </div>

    </div>
  );
}