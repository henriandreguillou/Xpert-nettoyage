const { Pool } = require("pg");
require("dotenv").config();

// Vérification des variables d'environnement essentielles
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("❌ Variables d'environnement DB manquantes");
}

console.log("🟢 DB USER:", process.env.DB_USER);
console.log("🟢 DB HOST:", process.env.DB_HOST);
console.log("🟢 DB NAME:", process.env.DB_NAME);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // pas besoin de String()
  port: Number(process.env.DB_PORT) || 5432,
});

// Test connexion au démarrage (optionnel mais recommandé)
pool.connect()
  .then((client) => {
    console.log("✅ Connexion PostgreSQL réussie");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur connexion PostgreSQL:", err.message);
  });

module.exports = pool;