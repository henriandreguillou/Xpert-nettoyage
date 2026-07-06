import { useEffect, useState } from "react";

export default function EditAdmin() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/admin/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setForm({
        nom: data.nom || "",
        prenom: data.prenom || "",
        email: data.email || "",
      });
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erreur");
        return;
      }

      setMessage("Profil mis à jour avec succès");
    } catch (err) {
      setMessage("Erreur serveur");
    }
  };

  return (
    <div className="profile-container">
      <h1>Modifier le profil</h1>

      <form onSubmit={handleSubmit} className="profile-card">
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder="Nom"
        />

        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          placeholder="Prénom"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <button type="submit">Enregistrer</button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}