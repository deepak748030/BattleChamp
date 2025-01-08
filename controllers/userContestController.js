const { getIo } = require('../sockets/socketService'); // Import the Socket.io instance
const Contest = require('../models/contestModel'); // Import Contest model
const ContestDetails = require('../models/contestDetailsModel'); // Import ContestDetails model if required
const UserContest = require('../models/userContestModel'); // Import UserContest model
const User = require('../models/userModel'); // Import User model for wallet details
const Transaction = require('../models/transaction'); // Import Transaction model

const joinUserContest = async (req, res) => {
    try {
        const { userId, contestId } = req.body;

        // Check if the user has already joined the contest
        const alreadyJoined = await UserContest.findOne({ userId, contestId });

        if (alreadyJoined) {
            return res.status(400).json({ status: false, message: 'User has already joined this contest' });
        }

        // Fetch the contest details to check the type (token or money)
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(400).json({ status: false, message: 'Contest not found' });
        }

        // Fetch user details to check wallet balances
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found' });
        }

        // Logic for token contests
        if (contest.contestType === 'token') {
            if (user.tokens < contest.entryFee) {
                return res.status(400).json({ status: false, message: 'Insufficient tokens' });
            }

            // Deduct tokens
            user.tokens -= contest.entryFee;
            await user.save();

            // Create a transaction for token contest
            const transactionData = {
                userId,
                type: 'Bet',
                status: 'Success',
                amount: contest.entryFee,
                gameName: contest.name,
                contestId: contest._id,
                result: 1,
            };
            const transaction = new Transaction(transactionData);
            await transaction.save(); // Save the transaction

        } else if (contest.contestType === 'money') {
            let remainingAmount = contest.entryFee;

            // First, deduct from bonus wallet (10%)
            let deductedAmount = 0;
            if (user.bonusWallet >= remainingAmount * 0.1) {
                deductedAmount = remainingAmount * 0.1;
                user.bonusWallet -= deductedAmount;
                remainingAmount -= deductedAmount;
            } else {
                deductedAmount = user.bonusWallet;
                remainingAmount -= deductedAmount;
                user.bonusWallet = 0;
            }

            // Deduct from deposit wallet if necessary
            if (remainingAmount > 0) {
                if (user.depositWallet >= remainingAmount) {
                    user.depositWallet -= remainingAmount;
                    remainingAmount = 0;
                } else {
                    remainingAmount -= user.depositWallet;
                    user.depositWallet = 0;
                }
            }

            // Deduct from winning wallet if necessary
            if (remainingAmount > 0) {
                if (user.winningWallet >= remainingAmount) {
                    user.winningWallet -= remainingAmount;
                    remainingAmount = 0;
                } else {
                    remainingAmount -= user.winningWallet;
                    user.winningWallet = 0;
                }
            }

            // If remaining amount is greater than 0, the user doesn't have enough funds
            if (remainingAmount > 0) {
                return res.status(400).json({ status: false, message: 'Insufficient wallet balance' });
            }

            // Save user updates
            await user.save();

            // Create a transaction for money contest
            const transactionData = {
                userId,
                type: 'Bet',
                status: 'Success',
                amount: contest.entryFee,
                gameName: contest.name,
                contestId: contest._id,
                result: 1,
            };
            const transaction = new Transaction(transactionData);
            await transaction.save(); // Save the transaction
        }

        // Create a new UserContest entry
        const newUserContest = new UserContest({ userId, contestId });
        await newUserContest.save();

        // Update the contestDetails by adding userId to the joinedPlayersData array
        await ContestDetails.findOneAndUpdate(
            { contestId },
            { $push: { joinedPlayerData: { userId, scoreBest: 0, scoreRecent: 0 } } }
        );

        // Reduce the available slots in the Contest model
        const updatedContest = await Contest.findOneAndUpdate(
            { _id: contestId, availableSlots: { $gt: 0 } },
            { $inc: { availableSlots: -1 } },
            { new: true }
        );

        // If contest was not found or slots are full
        if (!updatedContest) {
            return res.status(400).json({ status: false, message: 'No available slots for this contest' });
        }

        // Emit the updated contest data using Socket.io
        const io = getIo();
        io.emit('contestUpdated', {
            contestId: updatedContest._id,
            availableSlots: updatedContest.availableSlots,
            status: updatedContest.contestStatus
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