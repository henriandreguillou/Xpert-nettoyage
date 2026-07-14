import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, startOfToday, isBefore, parse } from "date-fns";
import { fr } from "date-fns/locale";

// Importation de React Datepicker (Déjà présent dans votre projet !)
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Enregistrement de la langue française pour le calendrier
registerLocale("fr", fr);

export default function CreateAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    request_num_rq: "",
    date_rdv: "", // Sera stocké au format "yyyy-MM-dd"
    heure_rdv: "",
    admin_id: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    appointment: null,
  });

  const minDate = format(startOfToday(), "yyyy-MM-dd");

  const formatDateFR = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy", { locale: fr });
  };

  useEffect(() => {
    const request = searchParams.get("request");
    if (request) {
      setFormData((prev) => ({ ...prev, request_num_rq: request }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Gestion du changement de date depuis DatePicker
  const handleDateChange = (date) => {
    if (!date) return;
    setFormData((prev) => ({
      ...prev,
      date_rdv: format(date, "yyyy-MM-dd"),
    }));
  };

  const isPastTime = () => {
    if (formData.date_rdv !== minDate || !formData.heure_rdv) return false;
    const currentTime = new Date();
    const selectedTime = parse(formData.heure_rdv, "HH:mm", new Date());
    return selectedTime < currentTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({ loading: false, message: "Vous devez être connecté", appointment: null });
      return;
    }

    if (isBefore(new Date(formData.date_rdv), startOfToday())) {
      setStatus({ loading: false, message: "Impossible de choisir une date passée", appointment: null });
      return;
    }

    if (isPastTime()) {
      setStatus({ loading: false, message: "Cette heure est déjà passée", appointment: null });
      return;
    }

    setStatus((prev) => ({ ...prev, loading: true, message: "", appointment: null }));

    try {
      const response = await axios.post(
        "http://localhost:5000/appointment",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.appointment) {
        throw new Error("Le rendez-vous n'a pas été créé");
      }

      setStatus({
        loading: false,
        message: response.data.message || "Rendez-vous créé avec succès",
        appointment: response.data.appointment,
      });

      setFormData((prev) => ({
        ...prev,
        date_rdv: "",
        heure_rdv: "",
        admin_id: "",
      }));
    } catch (error) {
      console.error(error.response?.data || error.message);
      setStatus({
        loading: false,
        message: error.response?.data?.message || "Erreur serveur",
        appointment: null,
      });
    }
  };

  const handleCancel = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté");
      return;
    }
    if (!formData.request_num_rq) {
      alert("Aucune demande sélectionnée");
      return;
    }
    if (!window.confirm("Voulez-vous supprimer cette demande ?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/request/${formData.request_num_rq}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Demande supprimée avec succès");
      navigate("/admin/requests");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Créer un rendez-vous</h2>

      {status.message && (
        <div className={`alert ${status.appointment ? "alert-success" : "alert-danger"}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Numéro demande</label>
          <input
            type="text"
            className="form-control"
            value={formData.request_num_rq}
            readOnly
          />
        </div>

        {/* INTEGRATION INTÉLLIGENTE DE REACT-DATEPICKER */}
        <div className="mb-3 d-flex flex-column">
          <label className="form-label">Date rendez-vous</label>
          <DatePicker
            selected={formData.date_rdv ? new Date(formData.date_rdv) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()} // Empêche la sélection de jours passés
            locale="fr"
            placeholderText="Sélectionnez une date..."
            className="form-control" // Récupère le style Bootstrap automatiquement
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Heure rendez-vous</label>
          <input
            type="time"
            className="form-control"
            name="heure_rdv"
            value={formData.heure_rdv}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">ID Administrateur</label>
          <input
            type="number"
            className="form-control"
            name="admin_id"
            value={formData.admin_id}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={status.loading}>
          {status.loading ? "Création..." : "Créer le rendez-vous"}
        </button>

        <button type="button" className="btn btn-danger ms-3" onClick={handleCancel}>
          Annuler la demande
        </button>
      </form>

      {status.appointment && (
        <div className="card mt-4">
          <div className="card-body">
            <h4>Rendez-vous créé</h4>
            <p><strong>Date :</strong> {formatDateFR(status.appointment.date_appointment)}</p>
            <p><strong>Heure :</strong> {status.appointment.heure_appointment}</p>
            <p><strong>Statut :</strong> {status.appointment.appointment_status}</p>
          </div>
        </div>
      )}
    </div>
  );
}