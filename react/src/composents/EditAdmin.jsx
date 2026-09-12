import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/profileAdmin.css";

import { API_URL } from "../config/api";

export default function EditAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Correction : Suppression du "/api" en double
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

        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setIsError(true);
        setMessage("Impossible de charger les données du profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Correction : Suppression du "/api" en double
      const res = await fetch(`${API_URL}/admin/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Erreur lors de la mise à jour");
        return;
      }

      // Redirection après succès
      navigate("/admin/profile");
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      setIsError(true);
      setMessage("Erreur connexion serveur");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "40px" }}>
        Chargement des données...
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Modifier le profil</h2>

      {message && (
        <div className={isError ? "error" : "success"}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Nom</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom"
          />
        </div>

        <div>
          <label className="form-label">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>

        <div>
          <label className="form-label">Téléphone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Téléphone"
          />
        </div>

        <button type="submit" className="btn-primary">
          Enregistrer
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/profile")}
        >
          Annuler
        </button>
      </form>
    </div>
  );
}