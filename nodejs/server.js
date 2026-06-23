const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// TEST ROUTE
// ======================
app.get('/', (req, res) => {
  res.send('API OK');
});

// ======================
// ROUTES RENDEZ-VOUS (clients)
// ======================
const rendezvousRoutes = require('./routes/rendezvousRoutes');
app.use('/rendezvous', rendezvousRoutes);

// ======================
// ROUTES ADMIN AUTH (JWT LOGIN)
// ======================
const authRoutes = require('./routes/auth.routes');
app.use('/api/admin', authRoutes);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur port ${PORT}`);
});


/*const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function createAdmin() {
  const email = "admin@test.com";
  const password = "123456";
  const nom = "Admin";
  const prenom = "Super";

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO admin (email, password_hash, nom, prenom) VALUES ($1, $2, $3, $4)",
    [email, hash, nom, prenom]
  );

  console.log("Admin créé !");
}

createAdmin();*/