const express = require('express');
const router = express.Router();


const {
  getRendezvous,
  getRendezvousByNum,
  createRendezvous,
  updateRendezvousByNum,
  deleteRendezvousByNum,
  getTakenHoursByDate,
} = require('../controllers/rendezvousController');


/*router.get('/', (req, res) => {
  res.json({ message: "OK rendezvous" });
});*/


router.get('/:num_rdv', getRendezvousByNum);
router.post('/', createRendezvous);
router.put("/:num_rdv", updateRendezvousByNum);
router.delete("/:num_rdv", deleteRendezvousByNum);

router.get("/heures/:date", getTakenHoursByDate);

module.exports = router; 