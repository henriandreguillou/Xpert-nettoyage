import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import "../style-css/request.css";

import { API_URL } from "../config/api";

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
    complement_adresse: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Synchronisation URL → state du formulaire
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
      formData.append("prenom", form.prenom || "");
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("adresse", form.adresse);
      formData.append("ville", form.ville);
      formData.append("code_postal", form.code_postal);

      if (form.complement_adresse.trim()) {
        formData.append("complement_adresse", form.complement_adresse.trim());
      }

      if (file) {
        formData.append("piece_jointe", file);
      }

      // Route alignée au pluriel: /requests
      await axios.post(`${API_URL}/requests`, formData, {
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
      setMessage("❌ " + (err.response?.data?.message || "Erreur serveur lors de la création"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Demander une estimation</h2>

      <form onSubmit={handleSubmit}>
        {/* Saisie selon le type de client */}
        {form.type_client === "particulier" ? (
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
        ) : (
          <input
            name="nom"
            placeholder="Nom de l'entreprise *"
            value={form.nom}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone *"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          name="adresse"
          placeholder="Adresse *"
          value={form.adresse}
          onChange={handleChange}
          required
        />
        <input
          name="ville"
          placeholder="Ville *"
          value={form.ville}
          onChange={handleChange}
          required
        />
        <input
          name="code_postal"
          placeholder="Code postal *"
          value={form.code_postal}
          onChange={handleChange}
          required
        />

        {/* Complément d'adresse facultatif */}
        <input
          name="complement_adresse"
          placeholder="Complément d'adresse (facultatif)"
          value={form.complement_adresse}
          onChange={handleChange}
        />

        {/* Fichier facultatif */}
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