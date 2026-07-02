import { useState } from "react";
import axios from "axios";

export default function CreateAppointment() {
  const [formData, setFormData] = useState({
    request_num_rq: "",
    date_rdv: "",
    heure_rdv: "",
    admin_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [appointment, setAppointment] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");
  setAppointment(null);

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Vous devez être connecté");
    setLoading(false);
    return;
  }

  try {
    const { data } = await axios.post(
      "http://localhost:5000/appointment",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage(data.message);
    setAppointment(data.appointment);

    setFormData({
      request_num_rq: "",
      date_rdv: "",
      heure_rdv: "",
      admin_id: "",
    });

  } catch (error) {
    setMessage(error.response?.data?.message || "Erreur serveur");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="container mt-4">
      <h2>Créer un rendez-vous</h2>

      {message && (
        <div
          className={`alert ${
            appointment ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Numéro de demande</label>
          <input
            type="text"
            className="form-control"
            name="request_num_rq"
            value={formData.request_num_rq}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            name="date_rdv"
            value={formData.date_rdv}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Heure</label>
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer le rendez-vous"}
        </button>
      </form>

      {appointment && (
        <div className="card mt-4">
          <div className="card-body">
            <h4>Rendez-vous créé</h4>

            <p>
              <strong>ID :</strong> {appointment.appointment_id}
            </p>

            <p>
              <strong>Date :</strong> {appointment.date_appointment}
            </p>

            <p>
              <strong>Heure :</strong> {appointment.heure_appointment}
            </p>

            <p>
              <strong>Statut :</strong> {appointment.appointment_status}
            </p>

            <hr />

            <h5>Demande</h5>

            <p>
              {appointment.request.prenom} {appointment.request.nom}
            </p>

            <p>{appointment.request.email}</p>

            <hr />

            <h5>Administrateur</h5>

            <p>
              {appointment.admin.prenom} {appointment.admin.nom}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}