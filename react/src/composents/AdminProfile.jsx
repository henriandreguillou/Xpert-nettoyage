import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/profileAdmin.css";

import {API_URL} from "../config/api"


export default function EditPassword() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/admin/me`, {
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

    fetchProfile();
  }, []);

  if (!admin) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="profile-container">
      <h1>Mon profil</h1>

      <div className="profile-card">
        <p>
          <strong>Nom :</strong> {admin.nom}
        </p>

        <p>
          <strong>Prénom :</strong> {admin.prenom}
        </p>

        <p>
          <strong>Email :</strong> {admin.email}
        </p>

        <p>
          <strong>Téléphone :</strong> {admin.phone}
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