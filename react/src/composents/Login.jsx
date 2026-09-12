import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style-css/login.css";

import { API_URL } from "../config/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Retrait du double '/api'
    const endpoint = `${API_URL}/admin/login`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const rawText = await response.text();
    let data = {};

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Réponse serveur invalide (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data.message || "Identifiants invalides");
    }

    if (!data?.token) {
      throw new Error("Token manquant dans la réponse serveur");
    }

    localStorage.setItem("token", data.token);
    navigate("/admin/calendar");
  } catch (err) {
    console.error("Login error:", err);
    setError(
      err.message === "Failed to fetch"
        ? "Impossible de contacter le serveur"
        : err.message
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}