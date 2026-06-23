import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg"
import "../style-css/header.css";

export default function Header() {
  const [open, setOpen] = useState(false); // Dropdown "Devis"
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu Burger Mobile
  const dropdownRef = useRef(null);
  const location = useLocation();

  // ✅ Ferme tout quand on change de page
  useEffect(() => {
    setOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  // ✅ Ferme dropdown et menu mobile si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Ferme avec ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
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

        {/* BOUTON BURGER (Mobile uniquement) */}
        <button 
          className={`burger-menu ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* CONTENEUR DES LIENS & DROPDOWN (Gère le responsive) */}
        <div className={`nav-navigation-wrapper ${isMenuOpen ? "show-menu" : ""}`}>
          
          {/* NAV LINKS */}
          <div className="nav-links-group">
            <Link className="nav-link" to="/services">Services</Link>
            <Link className="nav-link" to="/about">À propos</Link>
            <Link className="nav-link" to="/contact">Nous contacter</Link>
          </div>

          {/* DROPDOWN */}
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="dropdown-button"
              onClick={() => setOpen((prev) => !prev)}
            >
              Obtenir une estimation<span className={`arrow ${open ? "up" : ""}`}>▾</span>
            </button>

            {open && (
              <div className="dropdown">
                <Link
                  className="dropdown-item"
                  to="/request?type=particulier"
                >
                  Particulier
                </Link>

                <Link
                  className="dropdown-item"
                  to="/request?type=entreprise"
                >
                  Entreprise
                </Link>
              </div>
            )}
          </div>

        </div>

      </nav>
    </header>
  );
}

