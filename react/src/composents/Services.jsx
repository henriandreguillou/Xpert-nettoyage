import React from 'react';
import backgroundImg from '../assets/acceuil.png';
import "../style-css/service.css";

import entretienImg from '../assets/entretien.png';
import canapesImg from '../assets/canapes.png';
import matelasImg from '../assets/matelas.png';
import chaiseImg from '../assets/chaises.png';
import tapisImg from '../assets/tapis.png';
import tachesImg from '../assets/taches.png';

export default function ServicesList() {
  return (
    <div className="services-container" style={{ '--bg-image': `url(${backgroundImg})` }}>
      <div className="services-list">

        {/* Bloc 1 : Entretien textile d'hébergements */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={entretienImg} alt="Entretien textile d'hébergements" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>🏔️</span>
              <h3 className="services-title">Entretien textile d'hébergements</h3>
            </div>
            <p className="service-description">
              Entretien des canapés, fauteuils, tapis, matelas et assises textiles pour chalets,
               hôtels, résidences, locations saisonnières et restaurants. Intervention ponctuelle ou entretien régulier
            </p>
          </div>
        </div>

        {/* Bloc 2 : Canapés & fauteuils */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={canapesImg} alt="Canapés & fauteuils" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>🛋️</span>
              <h3 className="services-title">Canapés & fauteuils</h3>
            </div>
            <p className="service-description">
              Nettoyage en profondeur des canapés, fauteuils, banquettes et assises textiles. 
              Élimination des salissures, taches et odeurs du quotidien.
            </p>
          </div>
        </div>

        {/* Bloc 3 : Matelas & literie */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={matelasImg} alt="Matelas & literie" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>🛏️</span>
              <h3 className="services-title">Matelas & literie</h3>
            </div>
            <p className="service-description">
             Nettoyage des chaises tissu, banquettes, assises et têtes de lit. 
             Solution adaptée aux particuliers comme aux professionnels de l'hébergement.
            </p>
          </div>
        </div>

        {/* Bloc 4 : Chaises & assises textiles */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={chaiseImg} alt="Chaises & assises textiles" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>🪑</span>
              <h3 className="services-title">Chaises & assises textiles</h3>
            </div>
            <p className="service-description">
              Nettoyage des chaises tissu, banquettes, assises et têtes de lit. Solution adaptée aux particuliers c...
            </p>
          </div>
        </div>

        {/* Bloc 5 : Tapis & textiles décoratifs */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={tapisImg} alt="Tapis & textiles décoratifs" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>🧶</span>
              <h3 className="services-title">Tapis & textiles décoratifs</h3>
            </div>
            <p className="service-description">
              Nettoyage des tapis, descentes de lit, coussins et textiles décoratifs. 
              Méthodes adaptées à chaque matière.
            </p>
          </div>
        </div>

        {/* Bloc 6 : Tâches & odeurs persistantes */}
        <div className="services-item">
          <div className="service-image-wrapper">
            <img src={tachesImg} alt="Tâches & odeurs persistantes" className="service-image" />
          </div>
          <div className="service-content">
            <div className="service-header">
              <span>✨</span>
              <h3 className="services-title">Tâches & odeurs persistantes</h3>
            </div>
            <p className="service-description">
              Traitement ciblé des taches localisées, odeurs animales et 
              salissures incrustées sur les textiles d'ameublement.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}