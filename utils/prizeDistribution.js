const ContestDetails = require('../models/contestDetailsModel'); // Import the ContestDetails model
const Winners = require('../models/winnersModel'); // Import the Winners model
const moment = require('moment'); // For date formatting
const Contest = require('../models/contestModel');
const NodeCache = require('node-cache'); // Import node-cache
const contestCache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Cache with TTL of 5 minutes


async function distributePrizes(contestId, entryFee) {
    try {

        // Validate inputs
        if (!contestId || !entryFee || entryFee <= 0) {
            throw new Error('Invalid contest ID or entry fee');
        }

        // Check if contest data is cached
        let contest = contestCache.get(contestId);
        if (!contest) {
            // Fetch the contest data if not in cache
            contest = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
            if (!contest) {
                // Log and return if contest is not found, skipping this contest
                console.error(`Contest not found for ID: ${contestId}`);
                return;
            }

            // Cache the contest data for 5 minutes
            contestCache.set(contestId, contest);
        }

        const joinedPlayers = contest.joinedPlayerData;
        const n = joinedPlayers.length;

        if (n === 0) {
            console.error(`No players joined the contest: ${contestId}`);
            return;
        }

        // Ensure minimum players for prize distribution
        if (n < 2) {
            console.error(`Not enough players to distribute prizes in contest: ${contestId}`);
            return;
        }

        // Calculate the prize pool
        const totalPrizePool = n * entryFee;
        const adminShare = totalPrizePool * 0.3; // 30% admin share
        const newPrizePool = totalPrizePool - adminShare;

        // Sort players by their best scores (ascending) for inverse prize distribution
        joinedPlayers.sort((a, b) => a.scoreBest - b.scoreBest); // Ascending order

        // **Top 30% prize distribution**
        const topPlayersCount = Math.ceil(n * 0.3);
        const topPlayers = joinedPlayers.slice(0, topPlayersCount);
        const topPrizePool = newPrizePool * 0.5; // 50% of the remaining pool for top players

        // Total scores of Top 30% players
        const totalTopScore = topPlayers.reduce((sum, player) => sum + player.scoreBest, 0);

        // Distribute prizes dynamically for Top players
        topPlayers.forEach((player, index) => {
            if (index === 0) {
                // 1st place: 50% of the topPrizePool
                player.prize = Math.round(topPrizePool * 0.5);
            } else if (index === 1) {
                // 2nd place: 30% of the topPrizePool
                player.prize = Math.round(topPrizePool * 0.3);
            } else if (index === 2) {
                // 3rd place: 20% of the topPrizePool
                player.prize = Math.round(topPrizePool * 0.2);
            } else {
                // Remaining top players get prizes proportional to their scores (lower scores get lower prize)
                player.prize = Math.round((player.scoreBest / totalTopScore) * topPrizePool);
            }
        });

        // **Middle 50% prize distribution**
        const middlePlayersCount = Math.floor(n * 0.5);
        const middlePlayers = joinedPlayers.slice(topPlayersCount, topPlayersCount + middlePlayersCount);
        const middlePrizePool = newPrizePool * 0.5; // 50% of the remaining pool for middle players

        // Total scores of Middle 50% players
        const totalMiddleScore = middlePlayers.reduce((sum, player) => sum + player.scoreBest, 0);

        // Distribute prizes to Middle 50% players
        middlePlayers.forEach((player) => {
            player.prize = Math.round((player.scoreBest / totalMiddleScore) * middlePrizePool);
        });

        // **Remaining players are losers**
        const losingPlayers = joinedPlayers.slice(topPlayersCount + middlePlayersCount);
        losingPlayers.forEach((player) => {
            player.prize = 0; // No prize for losers
        });

        // Update the Winners collection
        const currentDate = moment().format('DD-MM-YYYY'); // Format date as 'dd-mm-yyyy'
        await Promise.all(
            joinedPlayers.map(async (player) => {
                if (player.prize > 0) {
                    // Update or insert winner details
                    await Winners.findOneAndUpdate(
                        { userId: player.userId, date: currentDate },
                        { $set: { winning: player.prize } }, // Update the prize amount
                        { upsert: true, new: true } // Create a new document if not found
                    );
                }
            })
        );

        // Log the prize distribution
        joinedPlayers.forEach((player) => {
            console.log(`User with best score ${player.scoreBest} wins ₹${player.prize}`);
        });

        console.log('Prizes distributed successfully');
        return joinedPlayers;
    } catch (error) {
        // Log and throw error for caller to handle
        console.error('Error distributing prizes:', error.message);
        throw error;
    }
}


setInterval(async () => {
    try {
        const contests = await Contest.find();
        contests.forEach(async (contest) => {
            // Ensure contest._id is a string
            const contestId = contest._id.toString();
            try {
                await distributePrizes(contestId, contest.amount);
            } catch (error) {
                console.error(`Error distributing prizes for contest ${contestId}: ${error.message}`);
            }
        });
    } catch (error) {
        console.error('Error in scheduled prize distribution:', error.message);
    }
}, 10 * 1000); // 10 seconds in milliseconds


module.exports = { distributePrizes }