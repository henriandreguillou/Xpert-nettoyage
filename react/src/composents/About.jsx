import React from "react";
import "../style-css/about.css";

export default function About() {
  return (
    <div className="about-page">
      
      <div className="about-card">

        <h1>À propos de Xpert Nettoyage</h1>

        <p>
          Chez <strong>Xpert Nettoyage</strong>, nous sommes spécialisés dans
          l’entretien et l’hygiène des textiles d’ameublement.
        </p>

        <p>
          Canapés, tapis, matelas, fauteuils, chaises et têtes de lit jouent
          un rôle essentiel dans le confort et l’hygiène de vos intérieurs.
        </p>

        <h2>Notre mission</h2>

        <p>
          Préserver durablement vos textiles afin qu’ils conservent leur
          élégance, leur confort et leur qualité dans le temps.
        </p>

        <h2>Notre expertise</h2>

        <p>
          Contrairement aux entreprises de nettoyage généralistes, nous sommes
          spécialisés dans les textiles d’intérieur.
        </p>

        <p>
          Chaque matière est traitée avec des méthodes adaptées pour garantir
          efficacité et respect des surfaces.
        </p>

        <h2>Nos engagements</h2>

        <ul>
          <li>✓ Hygiène impeccable</li>
          <li>✓ Préservation du mobilier</li>
          <li>✓ Confort et bien-être</li>
          <li>✓ Méthodes professionnelles</li>
          <li>✓ Réactivité et discrétion</li>
        </ul>

        <h2>Nos clients</h2>

        <p>
          Nous travaillons avec des particuliers, hôtels, chalets de prestige,
          conciergeries et résidences hôtelières.
        </p>

        <p className="highlight">
          L’excellence se joue dans les détails.
        </p>

      </div>
    </div>
  );
}