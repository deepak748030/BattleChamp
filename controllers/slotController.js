const Slots = require('../models/slotsModel');

// POST /slots - Create a new contest
const createSlot = async (req, res) => {
    try {
        const { gameId, amount, commission, contestStartDate, matchStartTime } = req.body;

        if (!gameId || !amount || !commission || !contestStartDate || !matchStartTime) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const newSlot = new Slots({ gameId, amount, commission, contestStartDate, matchStartTime });
        await newSlot.save();

        return res.status(201).json({ msg: 'Slot created successfully', data: newSlot });
    } catch (error) {
        return res.status(500).json({ msg: 'Error creating slot', error: error.message });
    }
};

// GET /slots/:gameId - Get contests by Game ID
const getSlotsByGameId = async (req, res) => {
    const { gameId } = req.params;

    try {
        const slots = await Slots.find({ gameId });

        if (!slots) {
            return res.status(404).json({ msg: 'No slots found for this game' });
        }

        return res.status(200).json({ msg: 'Slots retrieved successfully', data: slots });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching slots', error: error.message });
    }
};

module.exports = { createSlot, getSlotsByGameId };
