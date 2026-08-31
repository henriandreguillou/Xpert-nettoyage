import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style-css/requestsPage.css";

// URL d'API dynamique avec fallback sur Render
const API_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage.onrender.com";

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("Tous");

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/request/page`;

      if (selectedStatus !== "Tous") {
        url = `${API_URL}/request/status/${selectedStatus}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      let data = result.data || [];

      // 1. Tri pour "en attente" : du plus ancien au plus récent (selon la date de création)
      if (selectedStatus === "en attente") {
        data = [...data].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      }

      // 2. Tri pour "programmé" : du rendez-vous le plus proche au plus loin
      if (selectedStatus === "programmé") {
        data = [...data].sort((a, b) => {
          // Combiner la date et l'heure pour une précision parfaite
          const dateTimeA = new Date(`${a.date_appointment.split('T')[0]}T${a.heure_appointment || "00:00:00"}`);
          const dateTimeB = new Date(`${b.date_appointment.split('T')[0]}T${b.heure_appointment || "00:00:00"}`);
          
          return dateTimeA - dateTimeB;
        });
      }

      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Utilitaire pour formater la date proprement au format français
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  return (
    <div className="requests-page">
      <h1 className="requests-title">Liste des demandes</h1>

      {/* Barre de filtres par Statut */}
      <div className="status-filter-container">
        {["Tous", "en attente", "programmé"].map((status) => (
          <button 
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`status-filter-btn ${selectedStatus === status ? "active" : ""}`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <h2>Chargement...</h2>
      ) : (
        <div className="requests-table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>CP</th>
                <th>Complément</th>
                <th>Statut</th> 
                <th>Rendez-vous</th> {/* Colonne Date & Heure */}
                <th>Pièce jointe</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: "center", padding: "20px" }}>
                    Aucune demande trouvée avec le statut "{selectedStatus}"
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.num_rq}</td>
                    <td>{request.nom}</td>
                    <td>{request.prenom}</td>
                    <td>{request.email}</td>
                    <td>{request.phone}</td>
                    <td>{request.adresse}</td>
                    <td>{request.ville}</td>
                    <td>{request.code_postal}</td>
                    <td>{request.complement_adresse || "-"}</td>
                    
                    <td>
                      <span className={`status-badge ${request.status === "programmé" ? "status-programmed" : "status-pending"}`}>
                        {request.status || "en attente"}
                      </span>
                    </td>

                    {/* CELLULE MIS À JOUR AVEC TES COLONNES POSTGRES */}
                    <td className="appointment-cell">
                      {request.status === "programmé" && request.date_appointment ? (
                        <div className="appointment-datetime">
                          <span className="appt-date">{formatDate(request.date_appointment)}</span>
                          <span className="appt-time">à {request.heure_appointment?.substring(0, 5) || ""}</span>
                        </div>
                      ) : (
                        <span className="no-appointment">-</span>
                      )}
                    </td>

                    <td>
                      {request.piece_jointe ? (
                        <a
                          className="requests-link"
                          href={`${API_URL}/uploads/${request.piece_jointe}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir
                        </a>
                      ) : (
                        "Aucune"
                      )}
                    </td>

                    <td>
                      {request.status !== "programmé" && (
                        <Link
                          to={`/admin/appointment?request=${request.num_rq}`}
                          className="requests-btn"
                        >
                          RDV
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RequestsPage;