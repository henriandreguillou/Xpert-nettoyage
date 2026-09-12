const RAW_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage.onrender.com";

export const API_URL = RAW_URL.replace(/\/$/, "");