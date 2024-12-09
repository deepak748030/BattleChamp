const transaction = require('../models/transaction');
const Transaction = require('../models/transaction');
const User = require("../models/userModel")
const placeBet = async (req, res) => {
    try {
        const { userId, gameName, contestId, result } = req.body;

        const transaction = new Transaction({
            userId,
            type: 'Bet',
            gameName,
            contestId,
            result,
        });

        await transaction.save();
        res.status(201).json({ success: true, transaction });
    } catch (error) {
        console.error('Error placing bet:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addMoney = async (req, res) => {
    try {
        const { userId, amount, method, payId } = req.body;
     
            const transaction = new Transaction({
                userId,
                type: 'MoneyAdd',
                amount,
                method,
                payId,
            })
            await transaction.save();
            
            // find user for add money in user account 
            const user = await User.findOne({userId});
            user.depositWallet += amount; 
            await user.save();
            return res.status(201).json({ success: true, transaction });
        
    } catch (error) {
        console.error('Error adding money:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const withdrawMoney = async (req, res) => {
    try {
        const { userId, amount, method, payId } = req.body;

        const user = await User.findOne({userId});
        if (user.winningWallet >= amount) {
            const transaction = new Transaction({
                userId,
                type: 'Withdraw',
                amount,
                method,
                payId,
            });
            await transaction.save();
            user.winningWallet -= amount;
            await user.save()
          return res.status(201).json({ success: true, transaction , output : "withdraw successful"});
        }
        else{
            return res.json({success:false,transaction:`not enough balance , your winning  is ${user.winningWallet}, for withdraw`})
        }

        
    } catch (error) {
        console.error('Error withdrawing money:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTransactionsByType = async (req, res) => {
    try {
        const { userId, type } = req.params;
        const transactions = await Transaction.find({ userId, type });
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTransactionsByTypeOnly = async (req, res) => {
    try {
        const { type } = req.params;

        const transactions = await Transaction.find({ type });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    placeBet,
    addMoney,
    withdrawMoney,
    getTransactionsByType,
    getTransactionsByTypeOnly,
};