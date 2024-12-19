const Contest = require('../models/contestModel');
const ContestDetails = require('../models/contestDetailsModel');
const User = require('../models/userModel'); // User model for transactions
const Transaction = require('../models/transaction'); // Transaction model
const cron = require('node-cron');
const moment = require('moment'); // Use moment for date manipulation

// Cron task to run every 5 minutes
cron.schedule('*/5 * * * * *', async () => {
    try {
        const contests = await Contest.find({});

        // Get the current time
        const currentDateTime = moment();

        for (const contest of contests) {
            const { contestStartDate, matchStartTime, matchEndTime, contestStatus, winByRank, _id } = contest;

            // Combine the contest start date and match start time to create a full start datetime
            const contestStart = moment(`${contestStartDate} ${matchStartTime}`, 'YYYY-MM-DD HH:mm');
            const contestEnd = moment(`${contestStartDate} ${matchEndTime}`, 'YYYY-MM-DD HH:mm');

            let newStatus = contestStatus;

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

            // If the status has changed from 'live' to 'completed', create transactions
            if (newStatus !== contestStatus) {
                contest.contestStatus = newStatus;
                await contest.save(); // Save the updated contest status
                console.log(`Contest "${contest.name}" status updated to "${newStatus}".`);

                if (newStatus === 'completed') {
                    // Check if transactions for this contest have already been created
                    const existingTransactions = await Transaction.find({ contestId: _id });

                    // If transactions already exist, skip the creation of new ones
                    if (existingTransactions.length > 0) {
                        console.log(`Transactions for contest ${contest.name} already created. Skipping...`);
                        continue; // Skip creating transactions for this contest
                    }

                    // Loop through all the joined players in this contest and create transactions for them
                    const contestDetails = await ContestDetails.findOne({ contestId: _id });

                    // If contest details exist and players are joined
                    if (contestDetails && contestDetails.joinedPlayerData.length > 0) {
                        // Sort players by their score to determine the rank
                        const sortedPlayers = contestDetails.joinedPlayerData.sort((a, b) => b.scoreBest - a.scoreBest);

                        for (const player of sortedPlayers) {
                            const { userId, scoreBest } = player;
                            const user = await User.findById(userId);

                            // Get the player's rank (1-based index)
                            const playerRank = sortedPlayers.findIndex((p) => p.userId.toString() === userId.toString()) + 1;

                            // Find the winning amount based on the player's rank
                            let winningAmount = 0;

                            // Loop through the winByRank array and check for rank match
                            for (const rankRange of winByRank) {
                                const rank = rankRange.rank;
                                let rankStart, rankEnd;

                                // Check if the rank is a range or an individual rank
                                if (rank.includes('-')) {
                                    // If the rank is a range (e.g., "1-3")
                                    [rankStart, rankEnd] = rank.split('-').map(Number);
                                } else {
                                    // If it's an individual rank (e.g., "1")
                                    rankStart = rankEnd = Number(rank);
                                }

                                // Check if the player's rank falls within the range or matches the individual rank
                                if (playerRank >= rankStart && playerRank <= rankEnd) {
                                    winningAmount = rankRange.amount; // Set the winning amount
                                    break; // Exit the loop once the match is found
                                }
                            }

                            // If the winning amount is found, create the transaction
                            if (winningAmount > 0) {
                                // Create a Bet transaction for the player
                                const transactionData = {
                                    userId,
                                    type: 'Bet',
                                    status: 'Success',
                                    amount: winningAmount,
                                    gameName: contest.name,
                                    contestId: _id,
                                    result: 0,
                                };

                                const transaction = new Transaction(transactionData);
                                await transaction.save(); // Save the transaction

                                console.log(`Transaction created for user ${user.name} in contest ${contest.name}, amount: ${winningAmount}`);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating contest statuses:', error.message);
    }
});
