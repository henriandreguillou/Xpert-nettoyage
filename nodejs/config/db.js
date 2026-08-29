const mysql = require("mysql2/promise");
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

module.exports = pool;