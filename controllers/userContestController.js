const UserContest = require('../models/userContestModel');
const ContestDetails = require('../models/contestDetailsModel'); // Import the ContestDetails model

// POST /usercontest - Join a contest
const joinUserContest = async (req, res) => {
    try {
        const { userId, contestId } = req.body;

        const alreadyJoined = await UserContest.findOne({ userId, contestId });

        if (alreadyJoined) {
            return res.status(400).json({ msg: 'User has already joined this contest' });
        }

        const newUserContest = new UserContest({ userId, contestId });
        await newUserContest.save();

        // Update the contestDetails by adding userId to the joinedPlayersData array
        await ContestDetails.updateOne(
            { contestId }, // Match the contestId
            { $addToSet: { joinedPlayersData: userId } } // Add userId to joinedPlayersData array, avoiding duplicates
        );

        return res.status(201).json({ msg: 'User joined contest successfully', data: newUserContest });
    } catch (error) {
        return res.status(500).json({ msg: 'Error joining contest', error: error.message });
    }
};

// GET /usercontest/:userId - Get contests by User ID
const getContestsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        // Populate both userId (referencing User model) and contestId (referencing Slots model)
        const userContests = await UserContest.find({ userId })   // Populates the user details from User model
            .populate('contestId'); // Populates the contest details from Slots model

        if (!userContests || userContests.length === 0) {
            return res.status(404).json({ msg: 'No contests found for this user' });
        }

        return res.status(200).json({ msg: 'User contests retrieved successfully', data: userContests });
    } catch (error) {
        return res.status(500).json({ msg: 'Error fetching contests', error: error.message });
    }
};

module.exports = { joinUserContest, getContestsByUserId };
