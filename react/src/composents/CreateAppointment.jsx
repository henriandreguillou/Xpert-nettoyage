import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { format, startOfToday, isBefore, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

export default function CreateAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: appointmentId } = useParams(); // Récupère l'ID si on est en mode édition (/appointment/edit/:id)

  const isEditMode = Boolean(appointmentId);

  const [formData, setFormData] = useState({
    request_num_rq: "",
    date_rdv: "",
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
    const token = localStorage.getItem("token");
    let loggedAdminId = "";

    if (token) {
      try {
        const decoded = jwtDecode(token);
        loggedAdminId = decoded.id_admin || decoded.admin_id || decoded.id || "";
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }

    if (isEditMode) {
      // MODE ÉDITION : Charger le rendez-vous existant
      fetchExistingAppointment(appointmentId, token);
    } else {
      // MODE CRÉATION : Charger la demande liée
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
      const response = await axios.get(`http://localhost:5000/appointment/${id}`, {
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
        admin_id: data.admin_id || "",
      });
    } catch (error) {
      console.error("Erreur lors du chargement du RDV:", error);
      setStatus({
        loading: false,
        message: "Impossible de charger les données du rendez-vous",
        appointment: null,
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

    setStatus((prev) => ({ ...prev, loading: true, message: "", appointment: null }));

    try {
      let response;

      if (isEditMode) {
        response = await axios.put(
          `http://localhost:5000/appointment/${appointmentId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/appointment",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (!response.data.appointment) {
        throw new Error(isEditMode ? "Le rendez-vous n'a pas été modifié" : "Le rendez-vous n'a pas été créé");
      }

      setStatus({
        loading: false,
        message: response.data.message || (isEditMode ? "Rendez-vous modifié avec succès" : "Rendez-vous créé avec succès"),
        appointment: response.data.appointment,
      });

      if (isEditMode) {
        setTimeout(() => {
          navigate("/calendar");
        }, 1200);
      } else {
        setFormData((prev) => ({
          ...prev,
          date_rdv: "",
          heure_rdv: "",
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
      <h2>{isEditMode ? "Modifier le rendez-vous" : "Créer un rendez-vous"}</h2>

      {status.message && (
        <div className={`alert ${status.appointment ? "alert-success" : "alert-danger"}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="admin_id" value={formData.admin_id} />

        <div className="mb-3">
          <label className="form-label">Numéro demande</label>
          <input
            type="text"
            className="form-control"
            value={formData.request_num_rq}
            readOnly
          />
        </div>

        <div className="mb-3 d-flex flex-column">
          <label className="form-label">Date rendez-vous</label>
          <DatePicker
            selected={formData.date_rdv ? new Date(formData.date_rdv) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            locale="fr"
            placeholderText="Sélectionnez une date..."
            className="form-control"
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

        <button type="submit" className="btn btn-primary" disabled={status.loading}>
          {status.loading
            ? isEditMode ? "Modification..." : "Création..."
            : isEditMode ? "Mettre à jour" : "Créer le rendez-vous"
          }
        </button>

        <button type="button" className="btn btn-secondary ms-3" onClick={handleCancel}>
          {isEditMode ? "Annuler" : "Annuler la demande"}
        </button>
      </form>

      {status.appointment && (
        <div className="card mt-4">
          <div className="card-body">
            <h4>{isEditMode ? "Rendez-vous mis à jour" : "Rendez-vous créé"}</h4>
            <p><strong>Date :</strong> {formatDateFR(status.appointment.date_appointment || status.appointment.date_rdv)}</p>
            <p><strong>Heure :</strong> {status.appointment.heure_appointment || status.appointment.heure_rdv}</p>
            <p><strong>Statut :</strong> {status.appointment.appointment_status || "Confirmé"}</p>
          </div>
        </div>
      )}
    </div>
  );
}