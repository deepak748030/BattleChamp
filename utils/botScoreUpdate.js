const mongoose = require('mongoose');
const Contest = require('../models/contestModel'); // Contest model
const ContestDetails = require('../models/contestDetailsModel'); // ContestDetails model

async function processContestData(contestId, userRankData) {
    try {
        // Validate userRankData
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

        // Fetch contest and contest details
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

        // Check available slots
        if (contest.availableSlots === 0) {
            console.error('No available spots left');
            // If no slots, update random bot scores
            await updateRandomBotForFullContest(contest, userRankData);
            return;
        }

        // Sort joined players by scoreBest in descending order
        const joinedPlayerData = contestDetails.joinedPlayerData.sort((a, b) => b.scoreBest - a.scoreBest);
        joinedPlayerData.forEach((player, index) => {
            player.index = index + 1; // Assign index (1-based)
        });

        const userIndex = joinedPlayerData.findIndex((p) => p.userId.toString() === userId.toString());

        // Determine if a bot update is needed based on rank
        if (rank !== 'No Rank') {
            const [rankStart] = rank.split('-').map(Number);
            if (rankStart - userIndex > 0) {
                await updateRandomBot(contest, userRankData, contestDetails);
            }
        } else {
            const lastRankRange = contest.winByRank[contest.winByRank.length - 1].rank;
            const [_, lastRankEnd] = lastRankRange.split('-').map(Number);
            if (userIndex < lastRankEnd) {
                await updateRandomBot(contest, userRankData, contestDetails);
            }
        }
    } catch (error) {
        console.error('Error processing contest data:', error.message || error);
    }
}

// Helper Function: Update random bot score
async function updateRandomBot(contest, userRankData, contestDetails) {
    const joinedPlayerData = contestDetails.joinedPlayerData;

    // Loop through the joinedPlayerData and find a bot to update
    for (let i = 0; i < joinedPlayerData.length; i++) {
        const player = joinedPlayerData[i];
        if (player.userId.toString() !== userRankData.userId.toString() && player.userRole === 'bot') {
            // Bot found, now update score
            const randomAdditionalScore = Math.floor(Math.random() * 100); // Generates a random number between 0 and 99
            const updatedScore = userRankData.score + randomAdditionalScore;

            player.scoreBest = Math.max(player.scoreBest, updatedScore); // Update only if scoreBest improves
            player.scoreRecent = updatedScore;

            // Save updated contest details
            await contestDetails.save();
            console.log(`Updated bot "${player.userId}" scores in contest "${contest.name}"`);
            return;
        }
    }

    // If no bot is found, log this
    console.error('No existing bot found to update in contest', contest.name);
}

// Helper Function: Update random bot score for full contest (if no available slots)
async function updateRandomBotForFullContest(contest, userRankData) {
    const contestDetails = await ContestDetails.findOne({ contestId: contest._id });

    for (const player of contestDetails.joinedPlayerData) {
        // Check if the player is a bot and within the score range
        if (player.userRole === 'bot') {
            const randomAdditionalScore = Math.floor(Math.random() * 100);
            const updatedScore = userRankData.score + randomAdditionalScore;

            player.scoreBest = Math.max(player.scoreBest, updatedScore);
            player.scoreRecent = updatedScore;

            // Save updated contest details
            await contestDetails.save();
            console.log(`Updated bot "${player.userId}" scores for full contest "${contest.name}"`);
            return;
        }
    }

    // Log if no bot is found for updating
    console.error('No bots found matching the criteria for a full contest.');
}

module.exports = { processContestData };
