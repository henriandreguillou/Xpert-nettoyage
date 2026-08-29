import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/profileAdmin.css";

export default function EditPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // 1. Validation de la correspondance des mots de passe
    if (form.newPassword !== form.confirmPassword) {
      setIsError(true);
      setMessage("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // 2. Appel vers l'endpoint configuré
      const res = await fetch("http://localhost:5000/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          password: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Erreur lors du changement de mot de passe");
        return;
      }

      // 3. Redirection vers la page de profil
      navigate("/admin/profile");
    } catch (err) {
      setIsError(true);
      setMessage("Erreur serveur");
    }
  };

  return (
    <div className="container">
      <h2>Modifier le mot de passe</h2>

      {message && (
        <div className={isError ? "error" : "success"}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Mot de passe actuel</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Mot de passe actuel"
            required
          />
        </div>

        <div>
          <label className="form-label">Nouveau mot de passe</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Nouveau mot de passe"
            required
          />
        </div>

        <div>
          <label className="form-label">Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer le nouveau mot de passe"
            required
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