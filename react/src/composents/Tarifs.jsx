import React from 'react';
import {
  Sofa,
  Bed,
  Grid,
  Armchair,
  Sparkles,
  Info,
  Handshake,
  CalendarDays,
  MapPin,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import '../style-css/tarifs.css';

export default function TarifsPage() {
  return (
    <div className="tarifs-wrapper">
      <div className="tarifs-container">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="tarifs-main-header">
          {/* Logo XN */}
          <div className="brand-logo-area">
            <div className="brand-letters">XN</div>
            <div className="brand-subtitle">
              XPERT<span className="gold-text">NETTOYAGE</span>
            </div>
          </div>
          
          {/* Titre Principal */}
          <h1 className="main-page-title">NOS TARIFS</h1>
          
          {/* Badge Circulaire Flottant */}
          <div className="round-tva-badge">
            <div className="badge-top">TARIFS</div>
            <div className="badge-center">TTC</div>
            <div className="badge-bottom">AUCUNE TVA<br />APPLIQUÉE</div>
          </div>
        </div>

        {/* ================= SECTION 1: CANAPÉS ET FAUTEUILS ================= */}
        <div className="prices-section">
          <div className="category-blue-bar">
            <h2><Sofa className="category-lucide-icon" />CANAPÉS ET FAUTEUILS</h2>
            <span className="price-header-label">TARIF TTC</span>
          </div>
          <table className="prices-data-table">
            <tbody>
              <tr><td>Canapé 2 places</td><td className="price-cell">80 €</td></tr>
              <tr><td>Canapé 3 à 4 places</td><td className="price-cell">100 €</td></tr>
              <tr><td>Canapé 4 à 5 places</td><td className="price-cell">120 €</td></tr>
              <tr><td>Canapé 5 à 7 places</td><td className="price-cell">150 €</td></tr>
              <tr><td>Canapé + de 7 places</td><td className="price-cell">180 €</td></tr>
              <tr><td>Canapé d'angle (à partir de)</td><td className="price-cell">200 €</td></tr>
              <tr><td>Canapé en U</td><td className="price-cell">320 €</td></tr>
              <tr><td>Fauteuil standard</td><td className="price-cell">60 €</td></tr>
              <tr><td>Fauteuil club</td><td className="price-cell">80 €</td></tr>
              <tr><td>Fauteuil relax</td><td className="price-cell">80 €</td></tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 2: MATELAS ET TÊTES DE LIT ================= */}
        <div className="prices-section">
          <div className="category-blue-bar">
            <h2><Bed className="category-lucide-icon" /> MATELAS ET TÊTES DE LIT</h2>
            <span className="price-header-label">TARIF TTC</span>
          </div>
          
          <div className="split-columns-container">
            {/* Colonne Gauche - Matelas */}
            <div className="split-column-block">
              <h3 className="column-inner-title">MATELAS</h3>
              <table className="prices-data-table compact-table">
                <tbody>
                  <tr><td>90 cm</td><td className="price-cell">45 €</td></tr>
                  <tr><td>140 cm</td><td className="price-cell">65 €</td></tr>
                  <tr><td>160 cm</td><td className="price-cell">75 €</td></tr>
                  <tr><td>180 cm</td><td className="price-cell">90 €</td></tr>
                  <tr><td>200 cm</td><td className="price-cell">110 €</td></tr>
                </tbody>
              </table>
            </div>
            
            {/* Ligne Séparatrice Dorée */}
            <div className="vertical-gold-line"></div>
            
            {/* Colonne Droite - Têtes de lit */}
            <div className="split-column-block">
              <h3 className="column-inner-title">TÊTES DE LIT <span className="light-subtext">(TEXTILE)</span></h3>
              <table className="prices-data-table compact-table">
                <tbody>
                  <tr><td>90 cm</td><td className="price-cell">40 €</td></tr>
                  <tr><td>140 cm</td><td className="price-cell">55 €</td></tr>
                  <tr><td>160 cm</td><td className="price-cell">65 €</td></tr>
                  <tr><td>180 cm</td><td className="price-cell">75 €</td></tr>
                  <tr><td>200 cm</td><td className="price-cell">85 €</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: TAPIS ET MOQUETTES ================= */}
        <div className="prices-section">
          <div className="category-blue-bar">
            <h2><Grid className="category-lucide-icon" /> TAPIS ET MOQUETTES</h2>
            <span className="price-header-label">TARIF TTC</span>
          </div>
          <table className="prices-data-table">
            <tbody>
              <tr><td>Petit tapis (jusqu'à 1,5 m²)</td><td className="price-cell">50 €</td></tr>
              <tr><td>Moyen tapis (de 1,5 à 4 m²)</td><td className="price-cell">70 €</td></tr>
              <tr><td>Grand tapis (de 4 à 8 m²)</td><td className="price-cell">90 €</td></tr>
              <tr><td>Très grand tapis (plus de 8 m²)</td><td className="price-cell line-text-bold">à partir de 110 €</td></tr>
              <tr><td>Moquette (par m²)</td><td className="price-cell">6 €</td></tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 4: CHAISES ET SIÈGES ================= */}
        <div className="prices-section">
          <div className="category-blue-bar">
            <h2><Armchair className="category-lucide-icon" /> CHAISES ET SIÈGES</h2>
            <span className="price-header-label">TARIF TTC</span>
          </div>
          <table className="prices-data-table">
            <tbody>
              <tr><td>Chaise tissu (assise uniquement)</td><td className="price-cell">15 €</td></tr>
              <tr><td>Chaise avec dossier tissu</td><td className="price-cell">20 €</td></tr>
              <tr><td>Siège de bureau (assise + dossier)</td><td className="price-cell">30 €</td></tr>
              <tr><td>Banquette / Banc (par place)</td><td className="price-cell">25 €</td></tr>
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 5: TRAITEMENTS SPÉCIFIQUES ================= */}
        <div className="prices-section">
          <div className="category-blue-bar">
            <h2><Sparkles className="category-lucide-icon" /> TRAITEMENTS SPÉCIFIQUES</h2>
            <span className="price-header-label">TARIF TTC</span>
          </div>
          <table className="prices-data-table">
            <tbody>
              <tr><td>Traitement des odeurs</td><td className="price-cell">20 €</td></tr>
              <tr><td>Traitement urine animale</td><td className="price-cell">30 €</td></tr>
              <tr><td>Taches tenaces (vin, chocolat, café, graisse...)</td><td className="price-cell line-text-bold">Sur devis</td></tr>
              <tr><td>Forte salissure</td><td className="price-cell line-text-bold">+20 % du tarif</td></tr>
            </tbody>
          </table>
        </div>

        {/* ================= BANDEAU D'INFORMATION ================= */}
        <div className="legal-notice-banner">
          <Info className="notice-lucide-icon" />
          <p className="notice-content-text">
            Les tarifs sont donnés à titre indicatif et peuvent varier selon l'état du textile, 
            la configuration des lieux et les conditions d'interventions.
          </p>
        </div>

        {/* ================= BLOCS INFÉRIEURS D'ACTION ================= */}
        <div className="bottom-info-row">
          {/* Carte 1 */}
          <div className="action-info-card">
            <Handshake className="card-lucide-icon" />
            <div className="card-text-block">
              <h4>VOUS GÉREZ PLUSIEURS LOGEMENTS OU SOUHAITEZ UN ENTRETIEN RÉGULIER ?</h4>
              <p>Nous proposons des conditions tarifaires adaptées aux professionnels et aux interventions récurrentes.</p>
              <a href="#contact" className="card-accent-link">Étude personnalisée sur demande.</a>
            </div>
          </div>

          <div className="card-separator-line"></div>

          {/* Carte 2 */}
          <div className="action-info-card">
            <CalendarDays className="card-lucide-icon" />
            <div className="card-text-block">
              <h4>DEVIS GRATUIT SUR RENDEZ-VOUS</h4>
              <p>Contactez-nous pour un devis personnalisé et sans engagement.</p>
            </div>
          </div>

          <div className="card-separator-line"></div>

          {/* Carte 3 */}
          <div className="action-info-card highlight-card-content">
            <MapPin className="card-lucide-icon gold-color" />
            <div className="card-text-block">
              <h4>INTERVENTION EN</h4>
              <p className="bold-gold-location">HAUTE-SAVOIE & SUISSE ROMANDE</p>
            </div>
          </div>
        </div>

        {/* ================= FOOTER / ENGAGEMENTS ================= */}
        <div className="branding-commitments-footer">
          <div className="commitment-item">
            <div className="item-main-title">
              <CheckCircle2 className="footer-lucide-icon" /> ENTRETIEN PROFESSIONNEL
            </div>
            <div className="item-subtitle">RÉSULTATS DURABLES</div>
          </div>
          <div className="commitment-item">
            <div className="item-main-title">
              <Sparkles className="footer-lucide-icon" /> RESPECT DES TISSUS
            </div>
            <div className="item-subtitle">& DES MATIÈRES</div>
          </div>
          <div className="commitment-item">
            <div className="item-main-title">
              <Gauge className="footer-lucide-icon" /> MATÉRIEL PROFESSIONNEL
            </div>
            <div className="item-subtitle">HAUTE PERFORMANCE</div>
          </div>
        </div>

      </div>
    </div>
  );
}