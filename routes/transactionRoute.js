const express = require('express');
const { placeBet, addMoney, withdrawMoney, getTransactionsByType, getTransactionsByTypeOnly } = require('../controllers/transactionController');

const router = express.Router();

// Route to place a bet
router.post('/bet', placeBet);

// Route to add money
router.post('/add-money', addMoney);
 
// Route to withdraw money
router.post('/withdraw-money', withdrawMoney);

// Route to get transactions by type for a specific user
router.get('/:userId/:type', getTransactionsByType);

// Route to get transactions by type only
router.get('/:type', getTransactionsByTypeOnly);


module.exports = router;