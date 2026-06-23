import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import { useNavigate } from "react-router-dom";
import "../style-css/calendar.css";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/calendar",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formatted = res.data.map((rdv) => {
          // ✅ correction timezone
          const date = new Date(rdv.date_rdv);
          const heure = rdv.heure_rdv?.slice(0, 5);

          const start = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            heure ? parseInt(heure.split(":")[0]) : 0,
            heure ? parseInt(heure.split(":")[1]) : 0
          );

          return {
            id: rdv.id,
            title: rdv.nom,

            start: start.toISOString(),

            extendedProps: {
              nom: rdv.nom,
              prenom: rdv.prenom,
              heure,
              email: rdv.email,
              phone: rdv.phone,

              adresse: rdv.adresse,
              complement_adresse: rdv.complement_adresse,
              code_postal: rdv.code_postal,
              ville: rdv.ville,

              type_client: rdv.type_client,
              societe: rdv.societe,
            },
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error("Calendar error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const isEntreprise = selectedRdv?.type_client === "entreprise";

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={(info) => {
          setSelectedRdv(info.event.extendedProps);
        }}
      />

      {selectedRdv && (
        <div className="modal-overlay" onClick={() => setSelectedRdv(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Détails RDV</h3>

            {isEntreprise ? (
              <p>Société: {selectedRdv.societe || selectedRdv.nom}</p>
            ) : (
              <p>Nom: {selectedRdv.nom}</p>
            )}

            <p>Prénom: {selectedRdv.prenom || "-"}</p>
            <p>Heure: {selectedRdv.heure}</p>
            <p>Email: {selectedRdv.email || "-"}</p>
            <p>Téléphone: {selectedRdv.phone || "-"}</p>

            <p>Adresse: {selectedRdv.adresse || "-"}</p>
            <p>Complément d'adresse: {selectedRdv.complement_adresse || "-"}</p>
            <p>Code postal: {selectedRdv.code_postal || "-"}</p>
            <p>Ville: {selectedRdv.ville || "-"}</p>

            <button onClick={() => setSelectedRdv(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
