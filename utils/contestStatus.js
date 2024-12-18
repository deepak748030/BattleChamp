const Contest = require('../models/contestModel');
const cron = require('node-cron');
const moment = require('moment'); // Use moment for date manipulation

// Cron task to run every 5 minutes
cron.schedule('*/5 * * * * *', async () => {
    try {
        const contests = await Contest.find({});

        // Get the current time
        const currentDateTime = moment();

        for (const contest of contests) {
            const { contestStartDate, matchStartTime, matchEndTime } = contest;

            // Combine the contest start date and match start time to create a full start datetime
            const contestStart = moment(`${contestStartDate} ${matchStartTime}`, 'YYYY-MM-DD HH:mm');
            const contestEnd = moment(`${contestStartDate} ${matchEndTime}`, 'YYYY-MM-DD HH:mm');

            let newStatus = contest.contestStatus;

            // Update contest status based on current time
            if (currentDateTime.isBefore(contestStart)) {
                // Contest is upcoming
                newStatus = 'upcoming';
            } else if (currentDateTime.isBetween(contestStart, contestEnd, null, '[)')) {
                // Contest is live (current time is between start and end)
                newStatus = 'live';
            } else if (currentDateTime.isAfter(contestEnd)) {
                // Contest has ended (completed)
                newStatus = 'completed';
            }

            // If the status has changed, update the contest
            if (newStatus !== contest.contestStatus) {
                contest.contestStatus = newStatus;
                await contest.save(); // Save the updated contest status
                console.log(`Contest "${contest.name}" status updated to "${newStatus}".`);
            }
        }
    } catch (error) {
        console.error('Error updating contest statuses:', error.message);
    }
});

