const RAW_URL = import.meta.env?.VITE_API_URL || "https://xpert-nettoyage-fr-671126.hostingersite.com";

export const API_URL = RAW_URL.replace(/\/$/, "");