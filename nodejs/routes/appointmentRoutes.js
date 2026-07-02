const express = require('express');
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");


const {
  createAppointment,
  getTakenHoursByDate,
} = require('../controllers/appointmentController');


/*router.get('/', (req, res) => {
  res.json({ message: "OK rendezvous" });
});*/

router.post('/', verifyAdmin, createAppointment);
router.get("/heures/:date", verifyAdmin, getTakenHoursByDate);

module.exports = router; 