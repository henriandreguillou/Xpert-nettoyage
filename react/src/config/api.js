const RAW_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

// Base propre de l'API avec /api inclus
export const API_URL = `${RAW_URL.replace(/\/$/, "")}/api`;