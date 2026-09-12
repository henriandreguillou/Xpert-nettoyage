import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  useNavigate,
  useLocation,
  useSearchParams
} from "react-router-dom";

import { API_URL } from "../config/api";

export default function MesRendezvous() {
  const [numRdv, setNumRdv] = useState("");
  const [rendezvous, setRendezvous] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const fetchRdv = useCallback(async (numero) => {
    if (!numero) return;

    setLoading(true);
    setMessage("");

    try {
      // Endpoint réaligné sur la convention REST plurielle /appointments
      const response = await axios.get(`${API_URL}/appointments/rendezvous/${numero}`);
      setRendezvous(response.data.data);
    } catch (error) {
      console.error(error);
      setRendezvous(null);
      setMessage(
        error.response?.data?.message ||
        "Erreur lors de la récupération du rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (!numRdv.trim()) {
      setMessage("Veuillez saisir un numéro de rendez-vous.");
      return;
    }
    fetchRdv(numRdv.trim());
  };

  // Recharge automatique après modification ou redirection
  useEffect(() => {
    const numero = location.state?.numRdv;

    if (location.state?.refresh && numero) {
      setNumRdv(numero);
      fetchRdv(numero);
    }
  }, [location.state, fetchRdv]);

  const handleModify = () => {
    if (type) {
      navigate(`/modifier/${numRdv}?type=${type}`);
    } else {
      navigate(`/modifier/${numRdv}`);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Rechercher un rendez-vous</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Numéro de rendez-vous"
          value={numRdv}
          onChange={(e) => setNumRdv(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          disabled={loading}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {message && (
        <p style={{ color: rendezvous ? "green" : "red", marginBottom: "15px" }}>
          {message}
        </p>
      )}

      {rendezvous && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9"
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

          {rendezvous.adresse && (
            <p>
              <strong>Adresse :</strong> {rendezvous.adresse}
            </p>
          )}

          {rendezvous.code_postal && (
            <p>
              <strong>Code postal :</strong> {rendezvous.code_postal}
            </p>
          )}

          <br />

          <button onClick={handleModify}>
            Modifier mon rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}