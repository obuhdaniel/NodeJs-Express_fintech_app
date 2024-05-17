const mongoose = require('mongoose');

// Define the schema for transactions
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    receiverAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Income', 'Expense', 'Transfer'],
        required: true
    },
    category: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
