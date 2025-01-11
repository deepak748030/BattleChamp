const ContestDetails = require('../models/contestDetailsModel');
const contestModel = require('../models/contestModel');
const { getIo } = require('../sockets/socketService');
const { cache } = require('../utils/prizeDistribution');

async function getContestData(userData) {
    try {
        const contestData = await Promise.all(userData.map(async (user) => {
            let contest = await contestModel.findById(user.contestId).select('-__v -updatedAt').sort({ createdAt: -1 });
            if (!contest) {
                return null;
            }
            const userGameData = {
                "score": user.score,
                "rank": user.userRank,
                "winning": user.prizeAmount
            };
            const contestData = { ...contest.toObject(), game: userGameData };
            console.log(contestData);
            return contestData;
        }));
        // Sort by createdAt in descending order
        contestData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return contestData;
    } catch (error) {
        console.error('Error fetching contest data:', error.message);
        throw new Error('Error fetching contest data');
    }
}

const sendSocketData = async (contestId) => {
    try {
        // console.log(contestId)
        const data = await cache.get('distributedData');
        // console.log('data', data);
        if (!data) {
            return null;
        }
        const contest = data.find(contest => contest.contestId.toString() === contestId.toString());
        if (!contest) {
            console.log("not found")
            return null;
        }
        const contestData = await contestModel.findById(contestId).select('-__v -createdAt -updatedAt');
        const contestDetails = await ContestDetails.findOne({ contestId }).populate('joinedPlayerData.userId');
        if (!contestDetails) {
            return null;
        }

        const response = { ...contestData.toObject(), ...contestDetails.toObject() };
        const io = getIo();
        io.emit('updatedData', response);

    } catch (error) {
        console.error('Error fetching contest data:', error.message);
        throw new Error('Error fetching contest data');
    }
}



module.exports = { getContestData, sendSocketData };