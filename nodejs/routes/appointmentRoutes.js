const express = require('express');
const router = express.Router();
const verifyAdmin = require("../middleware/auth.middleware");

const {
  createAppointment,
  getTakenHoursByDate,
  getAppointmentsForCalendar,
  getAppointmentById, // 👈 1. Importer la méthode pour récupérer UN rendez-vous
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

router.post('/', verifyAdmin, createAppointment);
router.get("/heures/:date", verifyAdmin, getTakenHoursByDate);
router.get("/calendar", getAppointmentsForCalendar);

// 👈 2. Ajouter cette route GET avec le paramètre :id
router.get('/:id', verifyAdmin, getAppointmentById);

router.put('/:id', verifyAdmin, updateAppointment);
router.delete('/:id', verifyAdmin, deleteAppointment);

module.exports = router;