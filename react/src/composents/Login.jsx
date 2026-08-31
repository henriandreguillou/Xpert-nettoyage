import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style-css/login.css";

// Use environment variables for API endpoints in production
const API_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage.onrender.com";

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
      const res = await axios.post(`${API_URL}/api/admin/login`, {
        email,
        password,
      });

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token manquant dans la réponse serveur");
      }

      localStorage.setItem("token", token);
      navigate("/admin/calendar");
    } catch (err) {
      console.error("Login error:", err);

      // Handle server error response vs network error
      const errorMessage =
        err.response?.data?.message ||
        (err.request ? "Impossible de contacter le serveur" : err.message);

      setError(errorMessage);
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