const mongoose = require('mongoose');
const cron = require('node-cron');

// Import models
const ContestDetails = require('../models/contestDetailsModel');
const Contest = require('../models/contestModel');
const User = require('../models/userModel'); // For fetching bot users
const { getIo } = require('../sockets/socketService');

// Helper function to randomly select bots
function getRandomBots(bots, count, excludedBotIds) {
    const availableBots = bots.filter((bot) => !excludedBotIds.includes(bot._id.toString()));
    return availableBots.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Cron task to run every 2 minutes
cron.schedule('*/2 * * * *', async () => {
    try {
        // Step 1: Find all ContestDetails
        const contestDetailsList = await ContestDetails.find({}).populate({
            path: 'joinedPlayerData.userId',
            select: 'role', // Select role from User (to identify bots)
        });

        // Step 2: Filter contests with status 'upcoming' using the Contest model
        const upcomingContests = [];
        for (const contestDetails of contestDetailsList) {
            const contest = await Contest.findById(contestDetails.contestId).select(
                'contestStatus winByRank name totalSlots'
            );

            if (contest?.contestStatus === 'upcoming') {
                upcomingContests.push({ contestDetails, contest });
            }
        }

        // Step 3: Get all available bot users
        const allBots = await User.find({ role: 'bot' });
        if (!allBots.length) {
            console.error('No bots available to add.');
            return;
        }

        // Step 4: Loop through the filtered contests
        for (const { contestDetails, contest } of upcomingContests) {
            const { joinedPlayerData } = contestDetails;

            // Determine the last rank from winByRank
            const lastRankData = contest.winByRank[contest.winByRank.length - 1];
            const lastRank = lastRankData?.rank.includes('-')
                ? parseInt(lastRankData.rank.split('-')[1]) // Extract the upper bound of rank range
                : parseInt(lastRankData.rank); // Single rank scenario
            if (!lastRank) {
                console.warn(`Invalid last rank for contest: ${contest.name}`);
                continue;
            }

            // Step 5: Filter joined players with the role 'bot' and get their IDs
            const joinedBotIds = joinedPlayerData
                .filter((player) => player.userId?.role === 'bot')
                .map((player) => player.userId._id.toString());

            // Step 6: Check if bots are less than the required `lastRank`
            const botsToAddCount = lastRank - joinedBotIds.length;
            if (botsToAddCount > 0) {
                // Calculate the maximum number of bots to add in this iteration
                const botsToAddNow = Math.min(botsToAddCount, 5);

                // Randomly select bots excluding already joined bots
                const selectedBots = getRandomBots(allBots, botsToAddNow, joinedBotIds);

                for (const bot of selectedBots) {
                    // Add bot to joinedPlayerData
                    contestDetails.joinedPlayerData.push({
                        userId: bot._id,
                        scoreBest: 0,
                        scoreRecent: 0,
                    });
                }

                // Save the updated ContestDetails
                await contestDetails.save();

                // Step 7: Update the Contest with the number of joined players and available slots
                const joinedPlayerCount = contestDetails.joinedPlayerData.length;
                const availableSlots = contest.totalSlots - joinedPlayerCount;

                await Contest.findByIdAndUpdate(contest._id, {
                    joinedPlayerCount,
                    availableSlots,
                });

                const io = getIo();
                io.emit('contestUpdated', {
                    contestId: contest._id,
                    availableSlots: availableSlots,
                    contestStatus: contest.contestStatus
                });


                console.log(`Successfully added ${selectedBots.length} bot(s) to contest: ${contest.name}`);
            }
        }
    } catch (error) {
        console.error('Error processing upcoming contests:', error.message);
    }
});
