import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import "../style-css/header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Ferme le menu lors d'un changement de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Ferme le menu avec la touche ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className="header">
      <nav className="nav">

        {/* LOGO */}
        <Link to="/" className="logo-container">
          <img
            src={logo}
            alt="XPERTNETTOYAGE"
            className="logo-image"
          />
          <span className="logo-text">XPERTNETTOYAGE</span>
        </Link>

        {/* MENU BURGER */}
        <button
          className={`burger-menu ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Ouvrir le menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* NAVIGATION */}
        <div
          className={`nav-navigation-wrapper ${
            isMenuOpen ? "show-menu" : ""
          }`}
        >
          <div className="nav-links-group">
            <Link className="nav-link" to="/services">
              Services
            </Link>

            <Link className="nav-link" to="/about">
              À propos
            </Link>

            <Link className="nav-link" to="/contact">
              Nous contacter
            </Link>
          </div>

          {/* BOUTON PRENDRE RENDEZ-VOUS */}
          <Link className="dropdown-button" to="/request">
            Prendre rendez-vous
          </Link>
        </div>

      </nav>
    </header>
  );
}