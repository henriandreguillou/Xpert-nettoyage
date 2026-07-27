import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import "../style-css/headerAdmin.css";

export default function HeaderAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenProfile(false);
  }, [location]);

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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
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
    <header className="admin-header">
      <nav className="admin-header__nav">

        {/* LOGO */}
        <Link to="/admin/calendar" className="admin-header__logo-link">
          <img src={logo} alt="XPERTNETTOYAGE" className="admin-header__logo-img" />
          <span className="admin-header__logo-text">
            XPERTNETTOYAGE - ADMIN
          </span>
        </Link>

        {/* MENU NAV */}
        <div className={`admin-header__menu ${isMenuOpen ? "admin-header__menu--open" : ""}`}>
          <div className="admin-header__links">
            <Link className="admin-header__link" to="/admin/calendar">Planning</Link>
            <Link className="admin-header__link" to="/admin/request">Rendez-vous</Link>
            <Link className="admin-header__link" to="/">Retour au site</Link>
          </div>
        </div>

        {/* DROITE (PROFIL) */}
        <div className="admin-header__right">
          {admin && (
            <div className="admin-profile">
              <button
                className="admin-profile__trigger"
                onClick={() => setOpenProfile(!openProfile)}
              >
                 {admin.prenom} {admin.nom}
              </button>

              {openProfile && (
                <div className="admin-profile__dropdown">
                  <div className="admin-profile__info">
                    <strong className="admin-profile__name">{admin.prenom} {admin.nom}</strong>
                    <small className="admin-profile__email">{admin.email}</small>
                  </div>

                  <Link
                    to="/admin/profile"
                    className="admin-profile__item"
                    onClick={() => setOpenProfile(false)}
                  >
                    Mon profil
                  </Link>

                  <button
                    className="admin-profile__item admin-profile__item--logout"
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
            className={`admin-burger ${isMenuOpen ? "admin-burger--active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="admin-burger__line"></span>
            <span className="admin-burger__line"></span>
            <span className="admin-burger__line"></span>
          </button>
        </div>

      </nav>
    </header>
  );
}