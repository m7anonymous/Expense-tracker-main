const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], required: true },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
