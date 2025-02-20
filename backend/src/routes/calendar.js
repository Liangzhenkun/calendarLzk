const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar');

router.post('/record', calendarController.createOrUpdateRecord);
router.get('/record/:userId/:date', calendarController.getRecord);

module.exports = router;