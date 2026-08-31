import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useNavigate,
  useLocation,
  useSearchParams
} from "react-router-dom";

import {API_URL} from "../config/api"


export default function MesRendezvous() {
  const [numRdv, setNumRdv] = useState("");
  const [rendezvous, setRendezvous] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const fetchRdv = async (numero) => {
    if (!numero) return;

    try {
      setMessage("");

      // Modifié pour utiliser API_URL et la route correcte
      const response = await axios.get(`${API_URL}/appointment/rendezvous/${numero}`);

      setRendezvous(response.data.data);
    } catch (error) {
      console.error(error);
      setRendezvous(null);
      setMessage(
        error.response?.data?.message ||
        "Erreur récupération rendez-vous"
      );
    }
  };

  const handleSearch = () => {
    fetchRdv(numRdv);
  };

  // Recharge automatique après modification
  useEffect(() => {
    const numero = location.state?.numRdv;

    if (location.state?.refresh && numero) {
      setNumRdv(numero);
      fetchRdv(numero);
    }
  }, [location.state]);

  const handleModify = () => {
    navigate(`/modifier/${numRdv}`);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Rechercher un rendez-vous</h1>

      <input
        type="text"
        placeholder="Numéro de rendez-vous"
        value={numRdv}
        onChange={(e) => setNumRdv(e.target.value)}
      />

      <button onClick={handleSearch}>
        Rechercher
      </button>

      <br /><br />

      {message && <p>{message}</p>}

      {rendezvous && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h2>
            {rendezvous.nom} {rendezvous.prenom}
          </h2>

          <p>
            <strong>Date :</strong> {rendezvous.date_rdv}
          </p>

          <p>
            <strong>Heure :</strong> {rendezvous.heure_rdv}
          </p>

          <p>
            <strong>Adresse :</strong> {rendezvous.adresse}
          </p>

          <p>
            <strong>Code postal :</strong> {rendezvous.code_postal}
          </p>

          <br />

          <button onClick={handleModify}>
            Modifier mon rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}