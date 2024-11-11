const cron = require('node-cron');
const { fillSlotsWithBots } = require('./botService');
const Contest = require('../models/contestModel');
const { scheduleBotFillingTasks } = require('./botService');  // Import the scheduling logic

// Schedule bot joining every hour (or adjust as needed)
cron.schedule('0 * * * *', async () => {
    console.log('Checking for contests with available slots...');

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

module.exports = cron;
