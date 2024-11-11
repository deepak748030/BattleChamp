// const Contest = require('../models/contestModel'); // Use your existing Contest model
// const UserContest = require('../models/userContestModel');
// const ContestDetails = require('../models/contestDetailsModel');
// const Bot = require('../models/botModel');

// Helper function to parse time and calculate intervals
// const calculateTimeIntervals = (startTime, endTime) => {
//     const start = new Date(`1970-01-01T${startTime}:00Z`);
//     const end = new Date(`1970-01-01T${endTime}:00Z`);
//     const totalTime = end - start;

//     // Calculate 20%, 40%, 60%, and 80% intervals in milliseconds from start time
//     return [
//         totalTime * 0.2,
//         totalTime * 0.4,
//         totalTime * 0.6,
//         totalTime * 0.8
//     ].map(interval => start.getTime() + interval);
// };

// // Function to fill slots with unique bots and update available slots
// const fillSlotsWithBots = async (contestId) => {
//     try {
//         const contest = await Contest.findById(contestId);
//         if (!contest) throw new Error('Contest not found');

//         const maxBots = Math.min(Math.floor(contest.availableSlots * 0.15), contest.availableSlots);
//         let botsFilled = 0;
//         const triedBots = new Set();

//         while (botsFilled < maxBots) {
//             const bot = await Bot.aggregate([{ $sample: { size: 1 } }]);
//             if (!bot || bot.length === 0) break;
//             const botId = bot[0]._id.toString();

//             if (triedBots.has(botId)) continue;
//             triedBots.add(botId);

//             const alreadyJoined = await UserContest.findOne({ userId: botId, contestId });
//             if (alreadyJoined) continue;

//             const newBotEntry = new UserContest({ userId: botId, contestId });
//             await newBotEntry.save();

//             await ContestDetails.updateOne(
//                 { contestId },
//                 { $addToSet: { joinedPlayersData: { userId: botId } } }
//             );

//             // Decrement available slots in the Contest model
//             contest.availableSlots -= 1;
//             await contest.save(); // Save the updated available slots count

//             botsFilled++;
//         }

//         console.log(`Added ${botsFilled} bot(s) to contest ${contestId}`);
//     } catch (error) {
//         console.error(`Error filling slots with bots: ${error.message}`);
//     }
// };

// // Function to schedule bot-filling tasks at specific intervals
// const scheduleBotFillingTasks = async (contestId) => {
//     try {
//         const contest = await Contest.findById(contestId);
//         if (!contest) throw new Error('Contest not found');

//         const intervals = calculateTimeIntervals(contest.matchStartTime, contest.matchEndTime);
//         const now = Date.now();

//         intervals.forEach((interval, index) => {
//             const delay = interval - now;
//             if (delay > 0) {
//                 setTimeout(() => {
//                     fillSlotsWithBots(contestId);
//                     console.log(`Bot-filling task ${index + 1} executed for contest ${contestId}`);
//                 }, delay);
//             }
//         });
//     } catch (error) {
//         console.error(`Error scheduling bot-filling tasks: ${error.message}`);
//     }
// };

// module.exports = { scheduleBotFillingTasks };



const Contest = require('../models/contestModel'); // Contest model to get available slots and contest details
const UserContest = require('../models/userContestModel'); // Model to track user participation in contests
const ContestDetails = require('../models/contestDetailsModel'); // Model to track players' data in a contest
const Bot = require('../models/botModel'); // Model to get bot information

// Helper function to parse time and calculate intervals
const calculateTimeIntervals = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
    const totalTime = end - start;

    // Calculate 20%, 40%, 60%, and 80% intervals in milliseconds from start time
    return [
        totalTime * 0.2,
        totalTime * 0.4,
        totalTime * 0.6,
        totalTime * 0.8
    ].map(interval => start.getTime() + interval);
};

// Function to fill slots with unique bots and update available slots
const fillSlotsWithBots = async (contestId) => {
    try {
        const contest = await Contest.findById(contestId);
        if (!contest) throw new Error('Contest not found');

        // Max bots to be added based on 15% of available slots, not exceeding available slots
        const maxBots = Math.min(Math.floor(contest.availableSlots * 0.15), contest.availableSlots);
        let botsFilled = 0;
        const triedBots = new Set();

        while (botsFilled < maxBots) {
            const bot = await Bot.aggregate([{ $sample: { size: 1 } }]); // Randomly select a bot from the Bot collection
            if (!bot || bot.length === 0) break;
            const botId = bot[0]._id.toString();

            // Avoid adding duplicate bots
            if (triedBots.has(botId)) continue;
            triedBots.add(botId);

            // Check if the bot has already joined the contest
            const alreadyJoined = await UserContest.findOne({ userId: botId, contestId });
            if (alreadyJoined) continue;

            // Add bot to the UserContest collection
            const newBotEntry = new UserContest({ userId: botId, contestId });
            await newBotEntry.save();

            // Add bot to the contest details (joined players data)
            await ContestDetails.updateOne(
                { contestId },
                { $addToSet: { joinedPlayerData: { userId: botId } } }
            );

            // Decrement available slots in the Contest model
            contest.availableSlots -= 1;
            await contest.save(); // Save the updated available slots count

            botsFilled++;
        }

        console.log(`Added ${botsFilled} bot(s) to contest ${contestId}`);
    } catch (error) {
        console.error(`Error filling slots with bots: ${error.message}`);
    }
};

// Function to schedule bot-filling tasks at specific intervals
const scheduleBotFillingTasks = async (contestId) => {
    try {
        const contest = await Contest.findById(contestId);
        if (!contest) throw new Error('Contest not found');

        // Calculate the 20%, 40%, 60%, and 80% intervals
        const intervals = calculateTimeIntervals(contest.matchStartTime, contest.matchEndTime);
        const now = Date.now();

        // Schedule bot-filling tasks at each of the intervals
        intervals.forEach((interval, index) => {
            const delay = interval - now;
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

module.exports = { scheduleBotFillingTasks };
