const ContestDetails = require('../models/contestDetailsModel');

const updateResult = async (contestId, userId, newScore) => {
    try {
        // console.log(contestId, userId, newScore);

        // Retrieve the contest details by contestId (using findOne or create)
        let contest = await ContestDetails.findOne({ contestId });

        // If contest is not found, create a new contest
        if (!contest) {
            contest = new ContestDetails({
                contestId,
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
        } else {
            // Determine new scoreBest and scoreRecent based on newScore
            const updatedScoreBest = newScore > playerData.scoreBest ? newScore : playerData.scoreBest;
            const updatedScoreRecent = newScore < playerData.scoreRecent ? newScore : playerData.scoreRecent;

            // Update user's scores in the database
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
        }

        // Return the updated contest details
        return contest;
    } catch (err) {
        console.error(err);
        throw new Error(`Error updating result: ${err.message}`);
    }
};

module.exports = updateResult;
