const ContestDetails = require('../models/contestDetailsModel');
const UserContest = require('../models/userContestModel');
const Bot = require('../models/botModel');
const Contest = require('../models/contestModel');

// Helper function to calculate time intervals based on contest's match start and end times
const calculateTimeIntervals = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
    const totalTime = end - start;

    // Calculate intervals at 25%, 50%, 75%, and 100% of total contest duration
    return [
        totalTime * 0.25,
        totalTime * 0.5,
        totalTime * 0.75,
        totalTime
    ].map(interval => start.getTime() + interval);
};

// Function to fill slots with unique bots in a contest
const fillSlotsWithBots = async (contestId) => {
    try {
        // Fetch contest details
        const contest = await Contest.findById(contestId);
        if (!contest) throw new Error('Contest not found');

        // Calculate the max bots to add based on 5% of available slots, capped at available slots
        const maxBots = Math.min(Math.floor(contest.availableSlots * 0.05), contest.availableSlots);
        let botsFilled = 0;
        const triedBots = new Set(); // To keep track of already used bot IDs

        // Add bots to the contest until the required number of bots is reached
        while (botsFilled < maxBots) {
            const bot = await Bot.aggregate([{ $sample: { size: 1 } }]); // Select a random bot
            if (!bot || bot.length === 0) break; // Break if no bot is available
            const botId = bot[0]._id.toString();

            // Skip if bot has already been used or joined the contest
            if (triedBots.has(botId)) continue;
            triedBots.add(botId);

            // Check if the bot has already joined the contest
            const alreadyJoined = await UserContest.findOne({ userId: botId, contestId });
            if (alreadyJoined) continue;

            // Add bot to the UserContest collection (tracking bot participation)
            const newBotEntry = new UserContest({ userId: botId, contestId });
            await newBotEntry.save();

            // Add bot to the contest details (joined players data)
            await ContestDetails.updateOne(
                { contestId },
                { $addToSet: { joinedPlayerData: { userId: botId } } }
            );

            // Decrement available slots in the Contest model and save the updated data
            contest.availableSlots -= 1;
            await contest.save();

            botsFilled++; // Increment the bot-filled counter
        }

        console.log(`Added ${botsFilled} bot(s) to contest ${contestId}`);
    } catch (error) {
        console.error(`Error filling slots with bots: ${error.message}`);
    }
};

// Function to schedule bot-filling tasks based on contest's match start and end times
const scheduleBotFillingTasks = async (contestId) => {
    try {
        // Fetch contest details
        const contest = await Contest.findById(contestId);
        if (!contest) throw new Error('Contest not found');

        // Calculate the time intervals for bot-filling tasks based on contest start and end times
        const intervals = calculateTimeIntervals(contest.matchStartTime, contest.matchEndTime);
        const now = Date.now(); // Get the current time

        // Schedule bot-filling tasks at calculated intervals
        intervals.forEach((interval, index) => {
            const delay = interval - now; // Delay in milliseconds before executing the task
            if (delay > 0) {
                setTimeout(() => {
                    fillSlotsWithBots(contestId);
                    console.log(`Bot-filling task ${index + 1} executed for contest ${contestId}`);
                }, delay);
            }
        });
    } catch (error) {
        console.error(`Error scheduling bot-filling tasks: ${error.message}`);
    }
};

// Function to calculate the best score and distribute the prize based on the contest results
const calculateWinningAmount = async (contestId) => {
    try {
        // Fetch contest and contest details
        const contest = await Contest.findById(contestId);
        if (!contest) throw new Error('Contest not found');

        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        if (!contestDetails) throw new Error('Contest details not found');

        // Calculate total users and bots in the contest
        const totalUsers = contestDetails.joinedPlayerData.filter(player => !player.userId.isBot).length;
        const totalBots = contestDetails.joinedPlayerData.filter(player => player.userId.isBot).length;

        // Calculate the total amount based on users' entry fees
        const totalAmount = totalUsers * contest.amount;

        // Find the best score among all players
        const bestScoreData = contestDetails.joinedPlayerData.reduce((best, player) => {
            return player.scoreBest > best.scoreBest ? player : best;
        }, { scoreBest: -Infinity });

        const bestScore = bestScoreData.scoreBest;

        // Calculate the prize distribution based on score percentage
        let winningAmount = totalAmount;
        const scoreDistribution = contestDetails.joinedPlayerData.map(player => {
            const userAmount = (player.scoreBest / bestScore) * totalAmount;
            return {
                userId: player.userId,
                score: player.scoreBest,
                prizeAmount: userAmount,
            };
        });

        // Ensure the total distributed amount doesn't exceed the total prize
        const totalDistributedAmount = scoreDistribution.reduce((sum, data) => sum + data.prizeAmount, 0);
        if (totalDistributedAmount > totalAmount) {
            console.log(`Total distributed amount exceeds the contest prize. Adjusting...`);
            const adjustmentFactor = totalAmount / totalDistributedAmount;
            scoreDistribution.forEach(data => {
                data.prizeAmount *= adjustmentFactor; // Adjust individual prize amounts
            });
        }

        // Save the prize distribution in the contest details
        contestDetails.scoreDistribution = scoreDistribution;
        await contestDetails.save();

        console.log(`Prize distribution for contest ${contestId} has been calculated and saved.`);
    } catch (error) {
        console.error(`Error calculating winning amount: ${error.message}`);
    }
};

// Function to calculate the total amount collected from users, excluding bots
const findTotalAmountFromUsers = async (contestId) => {
    try {
        // Fetch contest details and calculate total user fees (excluding bots)
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        if (!contestDetails) throw new Error('Contest details not found');

        const totalUsers = contestDetails.joinedPlayerData.filter(player => !player.userId.isBot).length;
        const totalAmount = totalUsers * contestDetails.amount;

        console.log(`Total amount from users in contest ${contestId}: ${totalAmount}`);
        return totalAmount;
    } catch (error) {
        console.error(`Error finding total amount from users: ${error.message}`);
    }
};

module.exports = {
    calculateWinningAmount,
    findTotalAmountFromUsers,
    scheduleBotFillingTasks
};
