const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    voter_id: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password_hash: { type: String },
    status: { type: String, enum: ['pending', 'verified'], default: 'pending' },
    has_voted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voter', voterSchema);
