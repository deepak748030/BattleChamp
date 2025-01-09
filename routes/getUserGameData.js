const express = require('express');
const router = express.Router();
const { cache } = require('../utils/prizeDistribution');
const { getContestData } = require('../utils/getContestData');

router.post('/getUserGameData', async (req, res) => {
    try {
        const { userId } = req.body;
        const data = await cache.get('distributedData');
        console.log(data)
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        const userData = data.filter(user => user.userId == userId);
        if (userData.length === 0) {
            return res.status(404).json({ message: 'User data not found' });
        }
        const contestData = await getContestData(userData);

        if (!contestData || contestData.length === 0) {
            return res.status(404).json({ message: 'Contest data not found' });
        }

        if (!contestData || contestData.length === 0) {
            return res.status(404).json({ message: 'Contest data not found' });
        }


        // console.log(userId);
        // console.log(data)
        if (!userData) {
            return res.status(404).json({ message: 'User data not found' });
        }

        res.json({
            data: contestData
        });
    } catch (error) {
        console.error(`Error fetching game data for user ID ${req.params.userId}:`, error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
})



module.exports = router;