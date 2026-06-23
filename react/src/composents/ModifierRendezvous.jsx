import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale";

import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

const ModifierRendezvous = () => {

  const navigate = useNavigate();
  const { num_rdv } = useParams(); // ✅ IMPORTANT (correspond à ta route)

  const [selectedDate, setSelectedDate] = useState(null);
  const [takenHours, setTakenHours] = useState([]);

  const [formData, setFormData] = useState({
    date_rdv: "",
    heure_rdv: ""
  });

  const [message, setMessage] = useState("");

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);

    const formattedDate = formatDate(date);

    setFormData((prev) => ({
      ...prev,
      date_rdv: formattedDate,
      heure_rdv: ""
    }));

    try {
      const res = await axios.get(
        `http://localhost:5000/rendezvous/heures/${formattedDate}`
      );

      const hours = res.data.data.map((h) => h.slice(0, 5));
      setTakenHours(hours);

    } catch (error) {
      console.error(error);
    }
  };

  const availableHours = timeSlots.filter(
    (time) => !takenHours.includes(time)
  );

  // ✅ UPDATE RDV
  const handleUpdate = async () => {

  const confirmUpdate = window.confirm(
    "Confirmer la modification du rendez-vous ?"
  );

  if (!confirmUpdate) return;

  try {

    console.log("num_rdv =", num_rdv);
    console.log("formData =", formData);
    console.log("PUT URL =>", `http://localhost:5000/rendezvous/${num_rdv}`);
    console.log("DATA =>", formData);

    await axios.put(
      `http://localhost:5000/rendezvous/${num_rdv}`,
      formData
    );

    setMessage("Rendez-vous modifié avec succès");

    // Redirection vers la page détail
    navigate("/", {
      state: {
        refresh: true,
        numRdv: num_rdv
      }
    });

  } catch (error) {

    console.error(error);

    if (error.response) {
      console.log("Status :", error.response.status);
      console.log("Data :", error.response.data);
    }

    setMessage("Erreur lors de la modification");
  }
};

  // ❌ DELETE RDV
  const handleDelete = async () => {

    const confirmDelete = window.confirm(
      "Voulez-vous vraiment annuler ce rendez-vous ?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/rendezvous/${num_rdv}`
      );

      setMessage("Rendez-vous annulé");

      navigate("/");

    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la suppression");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>

      <h2>Modifier mon rendez-vous</h2>

      <p><strong>Numéro RDV :</strong> {num_rdv}</p>

      {message && <p>{message}</p>}

      {/* DATE */}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        locale="fr"
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        filterDate={(date) => date.getDay() !== 0}
      />

      <br /><br />

      {/* HEURE */}
      <select
        value={formData.heure_rdv}
        onChange={(e) =>
          setFormData({ ...formData, heure_rdv: e.target.value })
        }
      >
        <option value="">Choisir une heure</option>

        {availableHours.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={handleUpdate}>
        Enregistrer modification
      </button>

      <button
        onClick={handleDelete}
        style={{ marginLeft: "10px", background: "red", color: "white" }}
      >
        Annuler le rendez-vous
      </button>

    </div>
  );
};

export default ModifierRendezvous;