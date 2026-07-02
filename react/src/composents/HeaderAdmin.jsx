import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import "../style-css/headerAdmin.css";

export default function HeaderAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  const location = useLocation();

  // fermer menus au changement de page
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenProfile(false);
  }, [location]);

  // ESC pour fermer
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setOpenProfile(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // récupérer admin
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdmin();
  }, []);

  return (
    <header className="header">
      <nav className="nav">

        {/* LOGO */}
        <Link to="/admin/calendar" className="logo-container">
          <img src={logo} alt="XPERTNETTOYAGE" className="logo-image" />
          <span className="logo-text">
            XPERTNETTOYAGE - ADMIN
          </span>
        </Link>

        {/* MENU NAV */}
        <div className={`nav-navigation-wrapper ${isMenuOpen ? "show-menu" : ""}`}>
          <div className="nav-links-group">

            <Link className="nav-link" to="/admin/calendar">
              Planning
            </Link>

            <Link className="nav-link" to="/admin/appointment" >Créer un rendez-vous</Link>

            <Link className="nav-link" to="/">
              Retour au site
            </Link>

          </div>
        </div>

        {/* DROITE (PROFIL) */}
        <div className="nav-right">

          {admin && (
            <div className="profile-wrapper">

              <button
                className="profile-button"
                onClick={() => setOpenProfile(!openProfile)}
              >
                👤 {admin.prenom} {admin.nom}
              </button>

              {openProfile && (
                <div className="profile-dropdown">

                  <div className="profile-info">
                    <strong>{admin.prenom} {admin.nom}</strong>
                    <small>{admin.email}</small>
                  </div>

                  <Link
                    to="/admin/profile"
                    className="dropdown-item"
                    onClick={() => setOpenProfile(false)}
                  >
                    Mon profil
                  </Link>

                  <button
                    className="dropdown-item logout "
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                  >
                    Déconnexion
                  </button>

                </div>
              )}

            </div>
          )}

          {/* BURGER */}
          <button
            className={`burger-menu ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </nav>
    </header>
  );
}
