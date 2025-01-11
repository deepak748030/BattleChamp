const ContestDetails = require('../models/contestDetailsModel');
const Contest = require('../models/contestModel');
const cron = require('node-cron'); // For scheduling the function to run periodically
const { processContestData } = require('./botScoreUpdate');
const NodeCache = require('node-cache');
const cache = new NodeCache();


async function distributePrizesForAllContests() {
    try {
        // Fetch all contests from the database
        const liveContest = await Contest.find({ status: 'live' });
        if (liveContest) {
            for (const contest of liveContest) {
                await distributePrizes(contest._id);
            }
            const allContests = await Contest.find();
            if (!allContests || allContests.length === 0) {
                return; // No contests to process
            }
            // Process each contest
            let distributedData = [];
            for (const contest of allContests) {
                try {
                    const result = await distributePrizesCache(contest._id);
                    if (result.length > 0) {
                        distributedData.push(result);
                        distributedData = distributedData.flat();
                    }

                } catch (error) {
                    console.error(`Error distributing prizes for contest ID ${contest._id}:`, error.message);
                }
            }
            console.log('cache saved now search')
            cache.set('distributedData', distributedData);
            // Watch for changes in distributedData and update the cache
            const previousData = cache.get('distributedData');
            if (JSON.stringify(previousData) !== JSON.stringify(distributedData)) {
                cache.set('distributedData', distributedData);
                // console.log('-----------------------------------------------------------')
            }
        }
    } catch (error) {
        console.error('Error distributing prizes for all contests:', error.message);
    }
}

async function distributePrizesCache(contestId) {
    try {
        // Fetch contest data from the database
        // console.log('first')
        const contestData = await Contest.findById(contestId);
        if (!contestData) {
            throw new Error(`Contest with ID ${contestId} not found`);
        }

        // Helper function to check if a rank falls within a range
        const isRankInRange = (rank, range) => {
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                return rank >= start && rank <= end;
            }
            return rank === parseInt(range, 10); // For single rank like "1"
        };

        // Helper function to find the nearest rank for a given prize amount
        function findNearestRankForPrize(prizeAmount) {
            if (prizeAmount === 0) {
                return "No Rank";
            }
            let closestRank = null;
            let closestAmount = 0;

            for (const range of contestData.winByRank) {
                // For single rank like "1", directly compare the prize amount
                if (!range.rank.includes('-')) {
                    if (prizeAmount >= range.amount && range.amount > closestAmount) {
                        closestRank = range.rank; // Set closest rank to this rank
                        closestAmount = range.amount;
                    }
                }

                // For range like "2-5", we need to check if the prize falls in the range
                if (range.rank.includes('-')) {
                    const [start, end] = range.rank.split('-').map(Number);
                    // Check if the prize amount fits the range
                    if (prizeAmount >= range.amount) {
                        if (range.amount > closestAmount) {
                            closestRank = `${start}-${end}`;
                            closestAmount = range.amount;
                        }
                    }
                }
            }

            return closestRank || "No Rank";
        }

        // Fetch contest details for joined players
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        if (!contestDetails || !contestDetails.joinedPlayerData.length) {
            return; // No joined players, skip processing
        }

        const joinedPlayers = contestDetails.joinedPlayerData.filter(player => player.userId.role == 'user');
        // console.log("joined player", joinedPlayers.length);
        const { winByRank, totalSlots, amount } = contestData;

        // Calculate the total prize pool and admin share
        const totalPrizePool = joinedPlayers.length * amount;
        const adminShare = totalPrizePool * 0.3;
        const prizePoolForPlayers = totalPrizePool - adminShare;

        // Sort players by best score (descending order)
        joinedPlayers.sort((a, b) => b.scoreBest - a.scoreBest);

        // Adjust prize amounts proportionally based on total slots
        const adjustmentFactor = totalSlots > joinedPlayers.length ? joinedPlayers.length / totalSlots : 1;

        // Distribute prizes
        const prizeDistribution = [];
        let rank = 1;

        for (const player of joinedPlayers) {
            // Find rank range and prize amount
            const rankPrize = winByRank.find(rankRange => isRankInRange(rank, rankRange.rank));

            const prizeAmount = rankPrize
                ? Math.round((parseFloat(rankPrize.amount) / 100) * prizePoolForPlayers * adjustmentFactor) : 0; // Round the prize amount

            // Find nearest rank for prize
            const prizeRange = findNearestRankForPrize(prizeAmount);

            prizeDistribution.push({
                contestId,
                userId: player.userId._id,
                userName: player.userId.name, // Assuming User model has a "name" field
                score: player.scoreBest,
                prizeAmount, // Store the prize amount as a rounded integer
                rank: prizeRange,
                userRank: rank // Store the rank range for prize distribution
            });

            rank++;
        }

        return prizeDistribution;
    } catch (error) {
        console.error(`Error distributing prizes for contest ID ${contestId}:`, error.message);
        throw error;
    }
}

async function distributePrizes(contestId) {
    try {
        // Fetch contest data from the database
        const contestData = await Contest.findById(contestId);
        if (!contestData) {
            throw new Error(`Contest with ID ${contestId} not found`);
        }

        // Helper function to check if a rank falls within a range
        const isRankInRange = (rank, range) => {
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                return rank >= start && rank <= end;
            }
            return rank === parseInt(range, 10); // For single rank like "1"
        };

        // Helper function to find the nearest rank for a given prize amount
        function findNearestRankForPrize(prizeAmount) {
            if (prizeAmount === 0) {
                return "No Rank";
            }
            let closestRank = null;
            let closestAmount = 0;

            for (const range of contestData.winByRank) {
                // For single rank like "1", directly compare the prize amount
                if (!range.rank.includes('-')) {
                    if (prizeAmount >= range.amount && range.amount > closestAmount) {
                        closestRank = range.rank; // Set closest rank to this rank
                        closestAmount = range.amount;
                    }
                }

                // For range like "2-5", we need to check if the prize falls in the range
                if (range.rank.includes('-')) {
                    const [start, end] = range.rank.split('-').map(Number);
                    // Check if the prize amount fits the range
                    if (prizeAmount >= range.amount) {
                        if (range.amount > closestAmount) {
                            closestRank = `${start}-${end}`;
                            closestAmount = range.amount;
                        }
                    }
                }
            }

            return closestRank || "No Rank";
        }

        // Fetch contest details for joined players
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        if (!contestDetails || !contestDetails.joinedPlayerData.length) {
            return; // No joined players, skip processing
        }

        const joinedPlayers = contestDetails.joinedPlayerData.filter(player => player.userId.role == 'user');
        // console.log("joined player", joinedPlayers.length);
        const { winByRank, totalSlots, amount } = contestData;

        // Calculate the total prize pool and admin share
        const totalPrizePool = joinedPlayers.length * amount;
        const adminShare = totalPrizePool * 0.3;
        const prizePoolForPlayers = totalPrizePool - adminShare;

        // Sort players by best score (descending order)
        joinedPlayers.sort((a, b) => b.scoreBest - a.scoreBest);

        // Adjust prize amounts proportionally based on total slots
        const adjustmentFactor = totalSlots > joinedPlayers.length ? joinedPlayers.length / totalSlots : 1;

        // Distribute prizes
        const prizeDistribution = [];
        let rank = 1;

        for (const player of joinedPlayers) {
            // Find rank range and prize amount
            const rankPrize = winByRank.find(rankRange => isRankInRange(rank, rankRange.rank));

            const prizeAmount = rankPrize
                ? Math.round((parseFloat(rankPrize.amount) / 100) * prizePoolForPlayers * adjustmentFactor) : 0; // Round the prize amount

            // Find nearest rank for prize
            const prizeRange = findNearestRankForPrize(prizeAmount);

            prizeDistribution.push({
                contestId,
                userId: player.userId._id,
                userName: player.userId.name, // Assuming User model has a "name" field
                score: player.scoreBest,
                prizeAmount, // Store the prize amount as a rounded integer
                rank: prizeRange,
                userRank: rank // Store the rank range for prize distribution
            });

            rank++;
        }
        // console.log(prizeDistribution)
        for (const prize of prizeDistribution) {
            await processContestData(prize.contestId, prize);
        }
        // console.log(prizeDistribution)
        return prizeDistribution;
    } catch (error) {
        console.error(`Error distributing prizes for contest ID ${contestId}:`, error.message);
        throw error;
    }
}



// Schedule the function to run every minute using cron
cron.schedule(' */50 * * * * *', async () => {
    await distributePrizesForAllContests();
});

module.exports = { cache };
