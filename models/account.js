const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    accountNo: {
        type: String,
        required: true

    },
    accountName: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum: ['Savings', 'Credit', 'Current'],
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    creditBalance: {
        type: Number,
        default: 0
    },
    debitBalance: {
        type: Number,
        default: 0
    }


});



module.exports = mongoose.model('Account', AccountSchema);