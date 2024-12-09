// POST /usercontest - Join a contest
const { getIo } = require('../sockets/socketService'); // Import the Socket.io instance
const Contest = require('../models/contestModel'); // Import Contest model
const ContestDetails = require('../models/contestDetailsModel'); // Import ContestDetails model if required
const UserContest = require('../models/userContestModel'); // Import UserContest model

const joinUserContest = async (req, res) => {
    try {
        const { userId, contestId } = req.body;
 
        // Check if the user has already joined the contest
        const alreadyJoined = await UserContest.findOne({ userId, contestId });

        if (alreadyJoined) {
            return res.status(400).json({ status: false, message: 'User has already joined this contest' });
        }
// problem
        // Create a new UserContest entry
        const newUserContest = new UserContest({ userId, contestId });
        await newUserContest.save();

        // Update the contestDetails by adding userId to the joinedPlayersData array
        let a = await ContestDetails.findOneAndUpdate(
            { contestId },
             // Match the contestI 
             { $push: { joinedPlayerData:{userId,scoreBest:0,scoreRecent:0} }} // Add userId to joinedPlayersData array, avoiding duplicates
           ); 

        // Reduce the available slots in the Contest model
        const contest = await Contest.findOneAndUpdate(
            { _id: contestId, availableSlots: { $gt: 0 } }, // Ensure available slots are greater than 0
            { $inc: { availableSlots: -1 } }, // Decrement available slots by 1
            { new: true } // Return the updated contest document
        );

        // If contest was not found or slots are full
        if (!contest) {
            return res.status(400).json({ status: false, message: 'No available slots for this contest' });
        }

        // Emit the updated contest data using Socket.io
        const io = getIo();
        io.emit('contestUpdated', {
            contestId: contest._id,
            availableSlots: contest.availableSlots
        });

        res.status(201).json({ status: true, message: 'User joined contest successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error joining contest', error: error.message });
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
