const Contest = require('../models/contestModel');
const ContestDetails = require('../models/contestDetailsModel');
const User = require('../models/userModel'); // User model for transactions
const Transaction = require('../models/transaction'); // Transaction model
const cron = require('node-cron');
const moment = require('moment-timezone'); // Import moment-timezone for IST handling
const { getIo } = require('../sockets/socketService');
const sendNotification = require('./notification');

cron.schedule('*/5 * * * * *', async () => {
    try {
        // console.log('Cron job running...');

        // Step 1: Fetch all contests
        const contests = await Contest.find({}).populate('gameId', 'gameName');
        // Step 2: Get the current time in IST
        const currentDateTime = moment.tz('Asia/Kolkata'); // Use Indian Standard Time (IST)

        // Step 3: Loop through all contests
        for (const contest of contests) {
            const { contestStartDate, matchStartTime, matchEndTime, contestStatus, winByRank, _id } = contest;

            // Step 4: Combine the contest start date and match start time to create a full start datetime in IST
            const contestStart = moment.tz(`${contestStartDate} ${matchStartTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
            const contestEnd = moment.tz(`${contestStartDate} ${matchEndTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

            let newStatus = contestStatus;

            // Step 5: Update contest status based on the current time
            // console.log(contestStartDate, matchStartTime, matchEndTime, contestStatus)
            if (currentDateTime.isBefore(contestStart)) {
                // Contest is upcoming
                newStatus = 'upcoming';
            } else if (currentDateTime.isBetween(contestStart, contestEnd, null, '[)')) {
                // Contest is live (current time is between start and end)
                newStatus = 'live';
            } else if (currentDateTime.isAfter(contestEnd)) {
                // Contest has ended (completed)
                newStatus = 'completed';
                // console.log(newStatus, contestStatus, contest.contestStatus)
            }
            // Step 6: If the status has changed, update it and create transactions if contest is completed
            const io = getIo();
            io.emit('contestUpdated', {
                contestId: contest._id,
                availableSlots: contest.availableSlots,
                contestStatus: newStatus
            });
            if (newStatus !== contest.contestStatus) {
                // console.log('status completed')
                await Contest.findByIdAndUpdate(contest._id, { contestStatus: newStatus });
                // Emit the updated contest data using Socket.io

                console.log(`Contest "${contest.name}" status updated to "${newStatus}".`);
                // console.log('-------------status changed')
                if (newStatus == 'completed') {

                    // Step 7: Check if transactions for this contest have already been created
                    const existingTransactions = await Transaction.find({ contestId: _id, result: 0 });

                    // If transactions already exist, skip the creation of new ones
                    if (existingTransactions.length > 0) {
                        console.log(`Transactions for contest "${contest.name}" already created. Skipping...`);
                        continue; // Skip creating transactions for this contest
                    }

                    // Step 8: Fetch contest details and join player data
                    const contestDetails = await ContestDetails.findOne({ contestId: _id });

                    if (contestDetails && contestDetails.joinedPlayerData.length > 0) {
                        // Step 9: Sort players by their best score to determine rank
                        const sortedPlayers = contestDetails.joinedPlayerData.sort((a, b) => b.scoreBest - a.scoreBest);

                        for (const player of sortedPlayers) {
                            const { userId, scoreBest } = player;
                            const user = await User.findById(userId);

                            // Step 10: Get the player's rank (1-based index)
                            const playerRank = sortedPlayers.findIndex((p) => p.userId.toString() === userId.toString()) + 1;

                            // Step 11: Determine the winning amount based on the player's rank
                            let winningAmount = 0;

                            // Loop through the winByRank array and check for rank match
                            for (const rankRange of winByRank) {
                                const rank = rankRange.rank;
                                let rankStart, rankEnd;

                                // Step 12: Check if the rank is a range or an individual rank
                                if (rank.includes('-')) {
                                    // If the rank is a range (e.g., "1-3")
                                    [rankStart, rankEnd] = rank.split('-').map(Number);
                                } else {
                                    // If it's an individual rank (e.g., "1")
                                    rankStart = rankEnd = Number(rank);
                                }

                                // Step 13: Check if the player's rank falls within the range or matches the individual rank
                                if (playerRank >= rankStart && playerRank <= rankEnd) {
                                    winningAmount = rankRange.amount; // Set the winning amount
                                    break; // Exit the loop once the match is found
                                }
                            }

                            // Step 14: If the winning amount is found, create a transaction for the player
                            if (winningAmount > 0) {
                                // Create a Bet transaction for the player
                                const transactionData = {
                                    userId,
                                    type: 'Bet',
                                    status: 'Success',
                                    amount: winningAmount,
                                    gameName: contest.gameId.gameName,
                                    contestId: _id,
                                    result: 0,
                                };

                                const transaction = new Transaction(transactionData);
                                await transaction.save(); // Save the transaction


                                // Create a winner entry for the player
                                const winnerEntry = await createWinnerEntry(userId, winningAmount, currentDateTime.toDate());
                                if (winnerEntry) {
                                    console.log(`Winner entry created for user "${user.name}" with amount: ${winningAmount}`);
                                } else {
                                    console.error(`Failed to create winner entry for user "${user.name}"`);
                                }
                                // Update the user's wallet with the winning amount if the user role is 'user'
                                if (user.role == 'user') {
                                    await User.findByIdAndUpdate(userId, { $inc: { winningWallet: winningAmount } });
                                    console.log(`User "${user.name}"'s wallet updated with amount: ${winningAmount}`);
                                    let userStatus = 'win';
                                    let userName = user.name;
                                    let gameName = contest.name;
                                    sendNotification(userId, userStatus, userName, gameName)
                                }
                                io.emit('contestUpdated', {
                                    contestId: contest._id,
                                    availableSlots: contest.availableSlots,
                                    contestStatus: newStatus
                                });
                                console.log(`Transaction created for user "${user.name}" in contest "${contest.name}", amount: ${winningAmount}`);
                            } else {
                                try {
                                    let userStatus = 'lose';
                                    let userName = user.name;
                                    let gameName = contest.name;
                                    sendNotification(userId, userStatus, userName, gameName);
                                } catch (error) {
                                    console.error(`Error sending notification for user "${user.name}" in contest "${contest.name}":`, error.message);
                                }
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
