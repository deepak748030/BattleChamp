const Transaction = require('../models/transaction');
const User = require('../models/userModel');

const placeBet = async (req, res) => {
    try {
        const { userId, gameName, contestId, result, amount } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user has enough balance
        const totalBalance = user.depositWallet + user.winningWallet;
        if (amount > totalBalance) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct from deposit wallet first
        if (amount <= user.depositWallet) {
            user.depositWallet -= amount;
        } else {
            const remainingAmount = amount - user.depositWallet;
            user.depositWallet = 0;
            user.winningWallet -= remainingAmount;
        }

        // Save the updated user balance
        await user.save();

        // Create a new transaction for the bet
        const transaction = new Transaction({
            userId,
            type: 'Bet',
            gameName,
            contestId,
            result,
            amount,
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
        const { userId, amount, method, payId, status } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add money to the deposit wallet
        user.depositWallet += amount;
        await user.save();

        // Create a transaction for the added money
        const transaction = new Transaction({
            userId,
            type: 'MoneyAdd',
            amount,
            method,
            payId,
            status
        });

        await transaction.save();

        res.status(201).json({ success: true, transaction });
    } catch (error) {
        console.error('Error adding money:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const withdrawMoney = async (req, res) => {
    try {
        const { userId, amount, method, payId, status } = req.body;
        console.log(status);

        const user = await User.findById(userId);
        console.log(user);

        if (user?.winningWallet >= amount) {
            const transaction = new Transaction({
                userId,
                type: 'Withdraw',
                amount,
                method,
                payId,
                status
            });
            await transaction.save();
            user.winningWallet -= amount;
            await user.save()
            return res.status(201).json({ success: true, transaction, output: "withdraw successful" });
        }
        else {
            return res.json({ success: false, transaction: `not enough balance , your winning  is ${user?.winningWallet}, for withdraw` })
        }


    } catch (error) {
        console.error('Error withdrawing money:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error });
    }
};

const getTransactionsByType = async (req, res) => {
    try {
        const { userId, type } = req.params;

        // Find transactions by user ID and type
        const transactions = await Transaction.find({ userId, type }).limit(100);

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTransactionsByTypeOnly = async (req, res) => {
    try {
        const { type } = req.params;

        // Find transactions by type
        const transactions = await Transaction.find({ type });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTransactionByAddMoneyAndWithdraw = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find transactions by user ID and type
        const transactions = await Transaction.find({ userId, type: { $in: ['MoneyAdd', 'Withdraw'] } }).limit(100);
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    placeBet,
    addMoney,
    withdrawMoney,
    getTransactionsByType,
    getTransactionsByTypeOnly,
    getTransactionByAddMoneyAndWithdraw
};
