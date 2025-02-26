const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar');
const auth = require('../middleware/auth');

router.post('/record', auth, CalendarController.createOrUpdateRecord);
router.get('/record/:userId/:date', auth, CalendarController.getRecord);

module.exports = router;