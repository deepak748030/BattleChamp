const express = require('express');
const { getSlotsByGameId, createSlot } = require('../controllers/slotController');
const router = express.Router();

router.post('/slots', createSlot)

router.get('/slots/:gameId', getSlotsByGameId)


module.exports = router;
