import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/profileAdmin.css";

import { API_URL } from "../config/api";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Suppression du /api en doublon
        const res = await fetch(`${API_URL}/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container" style={{ textAlign: "center", padding: "40px" }}>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="profile-container" style={{ textAlign: "center", padding: "40px" }}>
        <p>Impossible de charger les données du profil.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>Mon profil</h1>

      <div className="profile-card">
        <p>
          <strong>Nom :</strong> {admin.nom || "-"}
        </p>

        <p>
          <strong>Prénom :</strong> {admin.prenom || "-"}
        </p>

        <p>
          <strong>Email :</strong> {admin.email || "-"}
        </p>

        <p>
          <strong>Téléphone :</strong> {admin.phone || "-"}
        </p>

        <div className="profile-actions">
          <button onClick={() => navigate("/admin/profile/edit")}>
            Modifier les informations
          </button>

          <button onClick={() => navigate("/admin/profile/edit_password")}>
            Modifier le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}