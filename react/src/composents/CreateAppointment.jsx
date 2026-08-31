import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { format, startOfToday, isBefore, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../style-css/CreateAppointment.css";

registerLocale("fr", fr);

// URL d'API dynamique avec fallback sur Render
const API_BASE_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage.onrender.com";

export default function CreateAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();

  const isEditMode = Boolean(appointmentId);

  const [formData, setFormData] = useState({
    request_num_rq: "",
    date_rdv: "",
    heure_rdv: "",
    description: "",
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
    const token = localStorage.getItem("token");
    let loggedAdminId = "";

    if (token) {
      try {
        const decoded = jwtDecode(token);
        loggedAdminId = decoded.id_admin || decoded.admin_id || decoded.id || "";
      } catch (error) {
        console.error("Erreur de décodage du token :", error);
      }
    }

    if (isEditMode) {
      fetchExistingAppointment(appointmentId, token);
    } else {
      const request = searchParams.get("request");
      setFormData((prev) => ({
        ...prev,
        request_num_rq: request || prev.request_num_rq,
        admin_id: loggedAdminId,
      }));
    }
  }, [searchParams, appointmentId, isEditMode]);

  const fetchExistingAppointment = async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;

      let formattedDate = "";
      if (data.date_appointment || data.date_rdv) {
        const rawDate = data.date_appointment || data.date_rdv;
        formattedDate = format(new Date(rawDate), "yyyy-MM-dd");
      }

      const rawHeure = data.heure_appointment || data.heure_rdv || "";

      setFormData({
        request_num_rq: data.request_num_rq || "",
        date_rdv: formattedDate,
        heure_rdv: rawHeure.substring(0, 5),
        description: data.description || data.need_description || "",
        admin_id: data.admin_id || "",
      });
    } catch (error) {
      console.error("Erreur chargement RDV :", error);
      setStatus({
        loading: false,
        message: "Impossible de charger les données du rendez-vous",
        appointment: null,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

    setStatus({ loading: true, message: "", appointment: null });

    try {
      const endpoint = isEditMode
        ? `${API_BASE_URL}/appointment/${appointmentId}`
        : `${API_BASE_URL}/appointment`;

      const method = isEditMode ? axios.put : axios.post;

      const response = await method(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.appointment) {
        throw new Error(isEditMode ? "Le rendez-vous n'a pas été modifié" : "Le rendez-vous n'a pas été créé");
      }

      setStatus({
        loading: false,
        message: response.data.message || (isEditMode ? "Rendez-vous modifié avec succès" : "Rendez-vous créé avec succès"),
        appointment: response.data.appointment,
      });

      // En mode création, reinitialisation des champs optionnels
      if (!isEditMode) {
        setFormData((prev) => ({
          ...prev,
          date_rdv: "",
          heure_rdv: "",
          description: "",
        }));
      }
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

    if (isEditMode) {
      navigate("/calendar");
      return;
    }

    if (!formData.request_num_rq) {
      alert("Aucune demande sélectionnée");
      return;
    }

    if (!window.confirm("Voulez-vous supprimer cette demande ?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/request/${formData.request_num_rq}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Demande supprimée avec succès");
      navigate("/admin/requests");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="appointment-page">
      <div className="appointment-card">
        <h2 className="appointment-title">
          {isEditMode ? "Modifier le rendez-vous" : "Créer un rendez-vous"}
        </h2>

        {status.message && (
          <div className={`alert ${status.appointment ? "alert-success" : "alert-danger"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="appointment-form">
          <input type="hidden" name="admin_id" value={formData.admin_id} />

          <div className="form-group">
            <label className="form-label">Numéro demande</label>
            <input
              type="text"
              className="form-input"
              value={formData.request_num_rq}
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date rendez-vous</label>
            <DatePicker
              selected={formData.date_rdv ? new Date(formData.date_rdv) : null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              locale="fr"                     
              calendarStartDay={1}           
              placeholderText="Sélectionnez une date..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Heure rendez-vous</label>
            <input
              type="time"
              className="form-input"
              name="heure_rdv"
              value={formData.heure_rdv}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description du besoin</label>
            <textarea
              className="form-input form-textarea"
              name="description"
              rows="4"
              placeholder="Précisez le besoin ou le motif du rendez-vous..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-submit" disabled={status.loading}>
              {status.loading
                ? isEditMode ? "Modification..." : "Création..."
                : isEditMode ? "Mettre à jour" : "Créer le rendez-vous"}
            </button>

            <button type="button" className="btn btn-cancel" onClick={handleCancel}>
              {isEditMode ? "Annuler" : "Annuler la demande"}
            </button>
          </div>
        </form>

        {status.appointment && (
          <div className="summary-card">
            <h4 className="summary-title">
              {isEditMode ? "Rendez-vous mis à jour" : "Rendez-vous créé"}
            </h4>
            <p className="summary-item">
              <strong>Date :</strong> {formatDateFR(status.appointment.date_appointment || status.appointment.date_rdv)}
            </p>
            <p className="summary-item">
              <strong>Heure :</strong> {status.appointment.heure_appointment || status.appointment.heure_rdv}
            </p>
            {status.appointment.description && (
              <p className="summary-item">
                <strong>Description :</strong> {status.appointment.description}
              </p>
            )}
            <p className="summary-item">
              <strong>Statut :</strong> {status.appointment.appointment_status || "Confirmé"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}