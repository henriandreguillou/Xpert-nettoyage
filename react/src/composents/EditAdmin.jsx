import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/profileAdmin.css";

import {API_URL} from "../config/api"


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

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${API_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/admin/me`, {
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

      // Redirection immédiate vers la page de profil après succès
      navigate("/admin/profile");
    } catch (err) {
      setIsError(true);
      setMessage("Erreur serveur");
    }
  };

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