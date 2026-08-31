import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import "../style-css/request.css";

// URL d'API dynamique avec fallback sur Render
const API_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage.onrender.com";

function Request() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    type_client: "particulier",
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    complement_adresse: "" // facultatif
  });

  const [file, setFile] = useState(null); // facultatif
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
    setFile(e.target.files[0] || null);
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

      // Complément d'adresse facultatif
      if (form.complement_adresse.trim()) {
        formData.append("complement_adresse", form.complement_adresse.trim());
      }

      // Fichier facultatif
      if (file) {
        formData.append("piece_jointe", file);
      }

      // Requête mise à jour vers l'URL Render
      await axios.post(`${API_URL}/request`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("✅ Demande créée avec succès !");

      // Réinitialisation du formulaire
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
        {form.type_client === "particulier" && (
          <>
            <input
              name="nom"
              placeholder="Nom *"
              value={form.nom}
              onChange={handleChange}
              required
            />

            <input
              name="prenom"
              placeholder="Prénom *"
              value={form.prenom}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input type="email" name="email" placeholder="Email *" value={form.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Téléphone *" value={form.phone} onChange={handleChange} required />
        <input name="adresse" placeholder="Adresse *" value={form.adresse} onChange={handleChange} required />
        <input name="ville" placeholder="Ville *" value={form.ville} onChange={handleChange} required />
        <input name="code_postal" placeholder="Code postal *" value={form.code_postal} onChange={handleChange} required />

        {/* 🏢 COMPLÉMENT D'ADRESSE (FACULTATIF) */}
        <input 
          name="complement_adresse" 
          placeholder="Complément d'adresse (facultatif)" 
          value={form.complement_adresse} 
          onChange={handleChange} 
        />

        {/* 📎 FICHIER (FACULTATIF) */}
        <div>
          <label htmlFor="file-upload" style={{ display: "block", marginBottom: "4px" }}>
            Pièce jointe (optionnel) :
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

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