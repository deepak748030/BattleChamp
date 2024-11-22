const cron = require('node-cron');
const { fillSlotsWithBots } = require('./botService');
const Contest = require('../models/contestModel');
const { scheduleBotFillingTasks } = require('./botService');  // Import the scheduling logic

// Function to calculate the prize distribution
const calculatePrize = (betAmount, userCount) => {
    const totalBetAmount = betAmount * userCount;
    const prize = totalBetAmount < betAmount ? totalBetAmount : betAmount;
    return prize;
};

// Schedule bot joining every 5 minutes (for checking contests and scheduling bot tasks)
cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for contests with available slots (every 5 minutes)...');

    // Fetch upcoming or live contests with empty slots
    const contests = await Contest.find({
        contestStatus: { $in: ['live'] },
        availableSlots: { $gt: 0 }
    });

    if (!contests || contests.length === 0) {
        console.log('No contests with available slots found.');
        return;
    }

    // Loop through all contests that need bots and schedule the bot-filling tasks
    for (const contest of contests) {
        console.log(`Scheduling bot-filling tasks for contest: ${contest._id}`);

        // Call the scheduling function to fill bots at specific intervals
        await scheduleBotFillingTasks(contest._id);
    }
});

// Schedule bot joining every 5 minutes (for immediately filling slots with bots)
cron.schedule('*/5 * * * *', async () => {
    console.log('Filling slots with bots every 5 minutes...');

    // Fetch upcoming or live contests with empty slots
    const contests = await Contest.find({
        contestStatus: { $in: ['live'] },
        availableSlots: { $gt: 0 }
    });

    if (!contests || contests.length === 0) {
        console.log('No contests with available slots found.');
        return;
    }

    // Loop through all contests that need bots and fill slots with bots
    for (const contest of contests) {
        console.log(`Filling slots with bots for contest: ${contest._id}`);

        // Fill slots with bots
        await fillSlotsWithBots(contest._id);
    }
});

// Function to fill 5% of available slots with bots when 3 users join
const fillBotsOnUserJoin = async (contestId) => {
    const contest = await Contest.findById(contestId);
    if (!contest) {
        console.log(`Contest with ID ${contestId} not found.`);
        return;
    }

    if (contest.joinedUsers.length === 3) {
        const availableSlots = contest.availableSlots;
        const botsToFill = Math.ceil(availableSlots * 0.05);
        console.log(`Filling ${botsToFill} slots with bots for contest: ${contest._id}`);
        await fillSlotsWithBots(contest._id, botsToFill);
    }
};

// Schedule the bot filling task every 25% of the contest duration
const scheduleBotFillingTasks = async (contestId) => {
    const contest = await Contest.findById(contestId);
    if (!contest) {
        console.log(`Contest with ID ${contestId} not found.`);
        return;
    }

    const duration = contest.duration; // Assuming duration is in minutes
    const interval = Math.ceil((duration * 0.25) * 60 * 1000); // Convert to milliseconds

    setInterval(async () => {
        await fillBotsOnUserJoin(contestId);
    }, interval);
};

module.exports = cron;
