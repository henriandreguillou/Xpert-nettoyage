const express = require('express');
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");

const {
  createAppointment,
  getTakenHoursByDate,
  getAppointmentsForCalendar,
  updateAppointment,
  deleteAppointment // 👈 S'assurer qu'il est bien importé ici
} = require('../controllers/appointmentController');

router.post('/', verifyAdmin, createAppointment);
router.get("/heures/:date", verifyAdmin, getTakenHoursByDate);
router.get("/calendar", getAppointmentsForCalendar);

// 👈 Cette ligne doit être présente
router.put('/:id', verifyAdmin, updateAppointment);
router.delete('/:id', verifyAdmin, deleteAppointment);

module.exports = router;