const mongoose = require('mongoose');
const User = require('../models/userModel'); // User model
const Contest = require('../models/contestModel'); // Contest model
const ContestDetails = require('../models/contestDetailsModel'); // ContestDetails model

async function processContestData(contestId, userRankData) {
    try {
        // console.log(userRankData.rank)
        // Step 0: Validate the userRankData is an object
        if (typeof userRankData !== 'object' || Array.isArray(userRankData)) {
            console.error('userRankData should be an object');
            return;
        }

        const { userId, rank, score } = userRankData;

        // Check if required fields are missing
        if (!contestId || !userId || !rank || !score) {
            console.error('contestId, userId, rank, and score are required');
            return;
        }

        // Step 2: Fetch contest and contest details
        const contest = await Contest.findById(contestId);
        if (!contest) {
            console.error('Contest not found');
            return;
        }

        const contestDetails = await ContestDetails.findOne({ contestId });
        if (!contestDetails) {
            console.error('Contest details not found');
            return;
        }

        if (contest.availableSlots == 0) {
            console.error('No available spots left');
            // If available slots are 0, add random bots with score within 100 points of user's score
            await addRandomBotForFullContest(contest, userRankData);
            return;
        }
        // Step 3: Sort joined players by scoreBest in descending order
        const joinedPlayerData = contestDetails.joinedPlayerData.sort((a, b) => b.scoreBest - a.scoreBest);
        joinedPlayerData.forEach((player, index) => {
            player.index = index + 1; // Assign index (1-based)
        });
        const userIndex = joinedPlayerData.findIndex(p => p.userId.toString() === userId.toString());
        // console.log('userrank', userIndex + 1)
        // console.log('.......')
        if (rank !== 'No Rank') {
            const [rankStart] = rank.split('-').map(Number);

            if (rankStart - userIndex > 0) {
                await addRandomBot(contest, userRankData);
            }
        } else if (rank === 'No Rank') {
            const lastRankRange = contest.winByRank[contest.winByRank.length - 1].rank;
            const [_, lastRankEnd] = lastRankRange.split('-').map(Number);

            // If user's rank is greater than the last rank end, add a random bot
            if (userIndex < lastRankEnd) {
                await addRandomBot(contest, userRankData);
            }
        }
    } catch (error) {
        console.error('Error processing contest data:', error.message || error);
    }
}

// Helper Function: Add random bot (to be used periodically)
async function addRandomBot(contest, userRankData) {
    const bots = await User.find({ role: 'bot' }).lean(); // Fetch all bot users
    const contestDetails = await ContestDetails.findOne({ contestId: contest._id });

    for (const bot of bots) {
        const isBotAlreadyInContest = contestDetails.joinedPlayerData.some(player => player.userId.toString() === bot._id.toString());
        if (!isBotAlreadyInContest) {
            const randomAdditionalScore = Math.floor(Math.random() * 100); // Generates a random number between 0 and 99
            const randomScore = userRankData.score + randomAdditionalScore;

            const botData = {
                userId: bot._id,
                scoreBest: randomScore,
                scoreRecent: randomScore
            };

            await ContestDetails.updateOne(
                { contestId: contest._id },
                { $push: { joinedPlayerData: botData } }
            );
            return; // Exit after adding one bot
        }
    }

    console.error('All bots are already in the contest');
}

// Helper Function: Add random bot for full contest (if no available slots)
async function addRandomBotForFullContest(contest, userRankData) {
    const bots = await User.find({ role: 'bot' }).lean(); // Fetch all bot users
    const contestDetails = await ContestDetails.findOne({ contestId: contest._id });

    for (const bot of bots) {
        const isBotAlreadyInContest = contestDetails.joinedPlayerData.some(player => player.userId.toString() === bot._id.toString());

        // Only add the bot if it isn't already in the contest and its score is within 100 of the user's score
        if (!isBotAlreadyInContest) {
            const randomAdditionalScore = Math.floor(Math.random() * 100); // Generates a random number between 0 and 99
            const randomScore = userRankData.score + randomAdditionalScore;

            // Only add the bot if its score is within 100 points of the current user's score
            if (Math.abs(userRankData.score - randomScore) <= 100) {
                const botData = {
                    userId: bot._id,
                    scoreBest: randomScore,
                    scoreRecent: randomScore
                };

                await ContestDetails.updateOne(
                    { contestId: contest._id },
                    { $push: { joinedPlayerData: botData } }
                );
                return; // Exit after adding one bot
            }
        }
    }

    console.error('All bots are already in the contest or no bot matches the score condition');
}

module.exports = { processContestData };
