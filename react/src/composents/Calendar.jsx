import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useNavigate } from "react-router-dom";
import "../style-css/calendar.css";

import {API_URL} from "../config/api"


export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Utilisation de API_URL au lieu de localhost
      const res = await axios.get(
        `${API_URL}/appointment/calendar`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formatted = res.data.map((rdv) => {
        let date;

        if (typeof rdv.date_rdv === "string") {
          if (rdv.date_rdv.includes("T") || rdv.date_rdv.includes("Z")) {
            const d = new Date(rdv.date_rdv);
            date = d.toLocaleDateString("fr-CA");
          } else {
            date = rdv.date_rdv.substring(0, 10);
          }
        } else {
          const d = new Date(rdv.date_rdv);
          date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }

        const heure = rdv.heure_rdv || "00:00:00";

        return {
          id: String(rdv.id),
          title:
            rdv.type_client === "entreprise"
              ? rdv.societe || "Entreprise"
              : `${rdv.nom || ""} ${rdv.prenom || ""}`,
          start: `${date}T${heure}`,
          extendedProps: {
            nom: rdv.nom || "",
            prenom: rdv.prenom || "",
            heure: heure.substring(0, 5),
            email: rdv.email || "",
            phone: rdv.phone || "",
            adresse: rdv.adresse || "",
            complement_adresse: rdv.complement_adresse || "",
            code_postal: rdv.code_postal || "",
            ville: rdv.ville || "",
            type_client: rdv.type_client,
            societe: rdv.societe || "",
            status: rdv.status || "",
            description: rdv.description || "",
          },
        };
      });

      setEvents(formatted);
    } catch (error) {
      console.error("Erreur calendrier :", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirection vers le formulaire d'édition
  const handleEdit = (id) => {
    setSelectedRdv(null);
    navigate(`/admin/appointment/edit/${id}`);
  };

  // Supprimer / Annuler le rendez-vous
  const deleteAppointment = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // Utilisation de API_URL au lieu de localhost
      await axios.delete(`${API_URL}/appointment/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      setSelectedRdv(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du rendez-vous :", error);
      alert("Erreur lors de l'annulation du rendez-vous.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#8e764d", fontFamily: "sans-serif" }}>
        Chargement du calendrier...
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={frLocale}
        timeZone="Europe/Paris"
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventContent={(eventInfo) => (
          <div className="custom-event">
            <span className="event-time">{eventInfo.timeText}</span>
            <span className="event-title">{eventInfo.event.title}</span>
          </div>
        )}
        eventClick={(info) => {
          setSelectedRdv({
            id: info.event.id,
            ...info.event.extendedProps,
          });
        }}
      />

      {selectedRdv && (
        <div className="modal-overlay" onClick={() => setSelectedRdv(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Détails du rendez-vous</h3>

            <div className="modal-body">
              {selectedRdv.type_client === "entreprise" ? (
                <p>
                  <b>Société : </b>{selectedRdv.societe}
                </p>
              ) : (
                <>
                  <p>
                    <b>Nom : </b>{selectedRdv.nom}
                  </p>
                  <p>
                    <b>Prénom : </b>{selectedRdv.prenom}
                  </p>
                </>
              )}

              <p>
                <b>Heure : </b>{selectedRdv.heure}
              </p>

              {selectedRdv.email && (
                <p>
                  <b>Email : </b>{selectedRdv.email}
                </p>
              )}

              {selectedRdv.phone && (
                <p>
                  <b>Téléphone : </b>{selectedRdv.phone}
                </p>
              )}

              {selectedRdv.adresse && (
                <p>
                  <b>Adresse : </b>
                  {`${selectedRdv.adresse} ${selectedRdv.complement_adresse ? selectedRdv.complement_adresse : ""}, ${selectedRdv.code_postal} ${selectedRdv.ville}`}
                </p>
              )}

              {selectedRdv.description && (
                <p>
                  <b>Description: </b>{selectedRdv.description}
                </p>
              )}
            </div>

            <div className="modal-actions" style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
              <button className="btn-edit" onClick={() => handleEdit(selectedRdv.id)}>
                Modifier
              </button>

              <button className="btn-cancel" onClick={() => deleteAppointment(selectedRdv.id)}>
                Annuler RDV
              </button>

              <button className="modal-close-btn" onClick={() => setSelectedRdv(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}