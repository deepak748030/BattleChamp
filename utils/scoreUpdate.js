const ContestDetails = require('../models/contestDetailsModel');

const updateResult = async (contestId, userId, newScore) => {
    try {
        console.log(contestId, userId, newScore);

        // Retrieve the contest details by contestId (using findOne or create)
        let contest = await ContestDetails.findOne({ contestId: contestId });

        // If contest is not found, create a new contest
        if (!contest) {
            contest = new ContestDetails({
                contestId: contestId,
                joinedPlayerData: [] // Initialize an empty array for joinedPlayerData
            });
            await contest.save(); // Save the new contest to the database
            console.log("New contest created.");
        }

        // Find the specific user's data in joinedPlayerData
        let playerData = contest.joinedPlayerData.find(player => player.userId.toString() === userId);

        // If player is not found, create new player data and push it to the array
        if (!playerData) {
            playerData = {
                userId,
                scoreBest: newScore, // Assign the new score as the best score initially
                scoreRecent: newScore // Assign the new score as the recent score initially
            };
            contest.joinedPlayerData.push(playerData);
            await contest.save(); // Save the updated contest with the new player data
            console.log("New player added to the contest.");
        }

        // Determine new scoreBest and scoreRecent based on newScore
        const updatedScoreBest = newScore > playerData.scoreBest ? newScore : playerData.scoreBest;
        const updatedScoreRecent = newScore < playerData.scoreRecent ? newScore : playerData.scoreRecent;

        // Update user'+s scores in the database
        await ContestDetails.findOneAndUpdate(
            { contestId, 'joinedPlayerData.userId': userId },
            {
                $set: {
                    'joinedPlayerData.$.scoreBest': updatedScoreBest,
                    'joinedPlayerData.$.scoreRecent': updatedScoreRecent
                }
            },
            { new: true }
        );

        // Retrieve updated contest details to calculate ranks
        const updatedContest = await ContestDetails.findOne({ contestId });

        // Check if there are any players in the updated contest
        if (!updatedContest || updatedContest.joinedPlayerData.length === 0) {
            throw new Error('No players found in the updated contest');
        }

        // Sort players by scoreBest in descending order to determine ranks
        const sortedPlayers = updatedContest.joinedPlayerData
            .sort((a, b) => b.scoreBest - a.scoreBest);

        // Find the current user's rank based on updated scoreBest
        const userRank = sortedPlayers.findIndex(player => player.userId.toString() === userId) + 1;

        // Check if the userRank is valid
        if (userRank === 0) {
            throw new Error('User rank not found');
        }

        // Find ranks immediately above and below, if they exist
        const higherRankPlayer = sortedPlayers[userRank - 2] || null; // User with one rank higher
        const lowerRankPlayer = sortedPlayers[userRank] || null;      // User with one rank lower

        // Return the updated contest details along with rank information
        return {
            updatedContest,
            userRank,
            higherRankPlayer,
            lowerRankPlayer
        };
    } catch (err) {
        console.error(err);
        throw new Error(`Error updating result: ${err.message}`);
    }
};


module.exports = updateResult;
