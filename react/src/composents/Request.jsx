import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";

import "../style-css/request.css";


registerLocale("fr", fr);

function Request() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [form, setForm] = useState({
    type_client: "particulier",
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    date_rdv: "",
    heure_rdv: "",
    adresse: "",
    ville: "",
    code_postal: "",
    complement_adresse: ""
  });

  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bookedHours, setBookedHours] = useState([]);

  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00"
  ];

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

  // récupérer heures déjà prises
    useEffect(() => {
      const fetchHours = async () => {
        if (!form.date_rdv) return;

        try {
          const res = await axios.get(
            `http://localhost:5000/rendezvous/heures/${form.date_rdv}`
          );

          const data = res.data?.data || []; // 🔥 IMPORTANT

          const hoursTaken = Array.isArray(data)
            ? data.map((h) => h.slice(0, 5))
            : [];

          setBookedHours(hoursTaken);
        } catch (err) {
          console.error("Erreur heures:", err);
        }
      };

      fetchHours();
    }, [form.date_rdv]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // format local sans bug timezone
  const formatDateLocal = (d) => {
    if (!d) return "";
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const day = new Date(form.date_rdv).getDay();
    if (day === 0) {
      setMessage("❌ Impossible de prendre rendez-vous le dimanche.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://localhost:5000/rendezvous", form);

      setMessage("✅ Rendez-vous créé avec succès !");

      setForm({
        type_client: "particulier",
        nom: "",
        prenom: "",
        email: "",
        phone: "",
        date_rdv: "",
        heure_rdv: "",
        adresse: "",
        ville: "",
        code_postal: "",
        complement_adresse: ""
      });

      setDate(null);
      setBookedHours([]);
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
        
        <input
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
        />
      )}



      {form.type_client === "particulier" && (
        
        <input
          name="prenom"
          placeholder="Prénom"
          value={form.prenom}
          onChange={handleChange}
        />
      )}

      


      <DatePicker
        selected={date}
        onChange={(d) => {
          setDate(d);

          setForm((prev) => ({
            ...prev,
            date_rdv: formatDateLocal(d)
          }));
        }}
        locale="fr"
        dateFormat="yyyy-MM-dd"
        filterDate={(day) => day.getDay() !== 0}
        placeholderText="Choisir une date"
      />

      <select
        name="heure_rdv"
        value={form.heure_rdv}
        onChange={handleChange}
        disabled={!form.date_rdv}
      >
        <option value="">Choisir une heure</option>

        {hours
          .filter((h) => !bookedHours.includes(h))
          .map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
      </select>

      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
      <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
      <input name="ville" placeholder="Ville" value={form.ville} onChange={handleChange} />
      <input name="code_postal" placeholder="Code postal" value={form.code_postal} onChange={handleChange} />
      <input name="complement_adresse" placeholder="Complément adresse" value={form.complement_adresse} onChange={handleChange} />

      <button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Créer le rendez-vous"}
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