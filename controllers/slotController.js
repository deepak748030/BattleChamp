const Slots = require('../models/slotsModel');

// POST /slots - Create a new contest
const createSlot = async (req, res) => {
    try {
        const {
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus
        } = req.body;

        // Check if all required fields are provided
        if (!gameId || !amount || !commission || !contestStartDate || !matchStartTime || !matchEndTime || !availableSlots || !totalSlots) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Create a new slot document
        const newSlot = new Slots({
            gameId,
            amount,
            commission,
            contestStartDate,
            matchStartTime,
            matchEndTime,
            availableSlots,
            totalSlots,
            contestStatus: contestStatus || 'upcoming' // Default to 'upcoming' if not provided
        });

        // Save the new slot to the database
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
        // Fetch slots by gameId
        const slots = await Slots.find({ gameId });

        // If no slots found, return 404
        if (!slots || slots.length === 0) {
            return res.status(404).json({ msg: 'No slots found for this game' });
        }

        // Return the retrieved slots
        return res.status(200).json({ msg: 'Slots retrieved successfully', data: slots });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching slots', error: error.message });
    }
};

module.exports = { createSlot, getSlotsByGameId };
