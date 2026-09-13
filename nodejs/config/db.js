/*const mysql = require("mysql2/promise");
require("dotenv").config();

// Vérification des variables d'environnement essentielles
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("❌ Variables d'environnement DB manquantes");
}

console.log("🟢 DB USER:", process.env.DB_USER);
console.log("🟢 DB HOST:", process.env.DB_HOST);
console.log("🟢 DB NAME:", process.env.DB_NAME);

// Création du pool de connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion
pool.getConnection()
  .then((connection) => {
    console.log("✅ Connexion MySQL réussie");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erreur connexion MySQL:", err.message);
  });

module.exports = pool;*/


const { Pool } = require("pg");
require("dotenv").config();

// 1. Validation des variables d'environnement essentielles
const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME"];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`❌ Variables d'environnement DB manquantes : ${missingVars.join(", ")}`);
}

// 2. Logs de vérification au démarrage
console.log("🟢 DB USER:", process.env.DB_USER);
console.log("🟢 DB HOST:", process.env.DB_HOST);
console.log("🟢 DB NAME:", process.env.DB_NAME);

// 3. Détection de l'environnement
const isLocalhost =
  process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

// 4. Configuration du Pool de connexions
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT) || 5432,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

// 5. Écoute des erreurs globales du pool
pool.on("error", (err) => {
  console.error("❌ Erreur inattendue sur un client PostgreSQL inactif :", err);
});

// 6. Test de connexion initial lors du lancement de l'application
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connexion PostgreSQL réussie !");
    client.release();
  } catch (err) {
    console.error("❌ Erreur de connexion PostgreSQL initiale :");
    console.error(err); // Affiche l'objet d'erreur complet (stack trace, code, detail)
  }
})();

module.exports = pool;