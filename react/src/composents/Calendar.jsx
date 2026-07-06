import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useNavigate } from "react-router-dom";
import "../style-css/calendar.css";

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
      const res = await axios.get(
        "http://localhost:5000/appointment/calendar",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formatted = res.data.map((rdv) => ({
        id: rdv.id,

        title:
          rdv.type_client === "entreprise"
            ? rdv.societe
            : `${rdv.nom} ${rdv.prenom}`,

        start: `${rdv.date_rdv.slice(0, 10)}T${rdv.heure_rdv}`,

        extendedProps: {
          nom: rdv.nom,
          prenom: rdv.prenom,
          heure: rdv.heure_rdv.slice(0, 5),
          email: rdv.email,
          phone: rdv.phone,
          adresse: rdv.adresse,
          complement_adresse: rdv.complement_adresse,
          code_postal: rdv.code_postal,
          ville: rdv.ville,
          type_client: rdv.type_client,
          societe: rdv.societe,
          status: rdv.status,
        },
      }));

      setEvents(formatted);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2>Chargement...</h2>;

  const isEntreprise = selectedRdv?.type_client === "entreprise";

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ]}
        locale={frLocale}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        editable={false}
        selectable={true}
        eventClick={(info) => {
          setSelectedRdv(info.event.extendedProps);
        }}
      />

      {selectedRdv && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRdv(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Détails du rendez-vous</h2>

            {isEntreprise ? (
              <p>
                <strong>Société :</strong>{" "}
                {selectedRdv.societe}
              </p>
            ) : (
              <>
                <p>
                  <strong>Nom :</strong>{" "}
                  {selectedRdv.nom}
                </p>

                <p>
                  <strong>Prénom :</strong>{" "}
                  {selectedRdv.prenom}
                </p>
              </>
            )}

            <p>
              <strong>Heure :</strong>{" "}
              {selectedRdv.heure}
            </p>

            <p>
              <strong>Email :</strong>{" "}
              {selectedRdv.email}
            </p>

            <p>
              <strong>Téléphone :</strong>{" "}
              {selectedRdv.phone}
            </p>

            <p>
              <strong>Adresse :</strong>{" "}
              {selectedRdv.adresse}
            </p>

            <p>
              <strong>Complément :</strong>{" "}
              {selectedRdv.complement_adresse || "-"}
            </p>

            <p>
              <strong>Code postal :</strong>{" "}
              {selectedRdv.code_postal}
            </p>

            <p>
              <strong>Ville :</strong>{" "}
              {selectedRdv.ville}
            </p>

            <button onClick={() => setSelectedRdv(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}