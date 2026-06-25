import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import "../style-css/request.css";

function Request() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [form, setForm] = useState({
    type_client: "particulier",
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    complement_adresse: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // sync URL → form
  useEffect(() => {
    if (typeFromUrl === "particulier" || typeFromUrl === "entreprise") {
      setForm((prev) => ({
        ...prev,
        type_client: typeFromUrl,
        prenom: typeFromUrl === "entreprise" ? "" : prev.prenom
      }));
    }
  }, [typeFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("type_client", form.type_client);
      formData.append("nom", form.nom);
      formData.append("prenom", form.prenom);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("adresse", form.adresse);
      formData.append("ville", form.ville);
      formData.append("code_postal", form.code_postal);
      formData.append("complement_adresse", form.complement_adresse);

      if (file) {
        formData.append("piece_jointe", file);
      }

      await axios.post("http://localhost:5000/request", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("✅ Demande créée avec succès !");

      setForm({
        type_client: "particulier",
        nom: "",
        prenom: "",
        email: "",
        phone: "",
        adresse: "",
        ville: "",
        code_postal: "",
        complement_adresse: ""
      });

      setFile(null);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Erreur serveur"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Demander une estimation</h2>

      <form onSubmit={handleSubmit}>
        {form.type_client === "entreprise" && (
          <input
            name="nom"
            placeholder="Société"
            value={form.nom}
            onChange={handleChange}
          />
        )}

        {form.type_client === "particulier" && (
          <>
            <input
              name="nom"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
            />

            <input
              name="prenom"
              placeholder="Prénom"
              value={form.prenom}
              onChange={handleChange}
            />
          </>
        )}

        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
        <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
        <input name="ville" placeholder="Ville" value={form.ville} onChange={handleChange} />
        <input name="code_postal" placeholder="Code postal" value={form.code_postal} onChange={handleChange} />
        <input name="complement_adresse" placeholder="Complément adresse" value={form.complement_adresse} onChange={handleChange} />

        {/* 📎 FILE UPLOAD */}
        <input
          type="file"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer la demande"}
        </button>
      </form>

      {message && (
        <p className={message.includes("❌") ? "error" : "success"}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Request;