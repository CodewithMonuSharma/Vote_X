const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { nanoid } = require('nanoid');
require('dotenv').config();

const Voter = require('./models/Voter');
const OTP = require('./models/OTP');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- HELPERS ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateRandomPassword = () => nanoid(10); // 10 chars secure password

// --- ADMIN APIs ---

// 1. Create a placeholder voter (Officer action)
app.post('/admin/create-voter', async (req, res) => {
    try {
        const { name, voter_id, phone } = req.body;

        // Check for duplicates
        const existing = await Voter.findOne({ voter_id });
        if (existing) return res.status(400).json({ error: 'Duplicate Voter ID' });

        const newVoter = new Voter({ name, voter_id, phone, status: 'pending' });
        await newVoter.save();

        res.json({ message: 'Voter created in pending state', voter: newVoter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTH APIs ---

// 2. Send OTP (Mock SMS)
app.post('/auth/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        const voter = await Voter.findOne({ phone, status: 'pending' });
        
        if (!voter) return res.status(404).json({ error: 'Pending voter not found with this phone' });

        const otpCode = generateOTP();
        const expires_at = new Date(Date.now() + 5 * 60000); // 5 minutes

        // Save OTP (replace if exists)
        await OTP.findOneAndDelete({ phone });
        await new OTP({ phone, otp_code: otpCode, expires_at }).save();

        // MOCK SMS: In production, use Twilio/SMS service
        console.log(`\n--- [SMS GATEWAY] ---`);
        console.log(`To: ${phone}`);
        console.log(`Message: Your Shield-Vote OTP is ${otpCode}. Valid for 5 mins.`);
        console.log(`----------------------\n`);

        res.json({ message: 'OTP sent successfully (check server logs in dev)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Verify OTP and Generate Password
app.post('/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp_code } = req.body;

        const record = await OTP.findOne({ phone, otp_code });
        if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

        // Update Voter account
        const voter = await Voter.findOne({ phone, status: 'pending' });
        if (!voter) return res.status(404).json({ error: 'Voter not found' });

        const rawPassword = generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        voter.password_hash = await bcrypt.hash(rawPassword, salt);
        voter.status = 'verified';
        await voter.save();

        // Cleanup OTP
        await OTP.deleteOne({ _id: record._id });

        res.json({
            message: 'OTP Verified! Account is now active.',
            voter_id: voter.voter_id,
            generated_password: rawPassword // Only show once
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Voter Login
app.post('/auth/login', async (req, res) => {
    try {
        const { voter_id, password } = req.body;

        const voter = await Voter.findOne({ voter_id, status: 'verified' });
        if (!voter) return res.status(401).json({ error: 'Invalid ID or account not verified' });

        const isMatch = await bcrypt.compare(password, voter.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        // Create JWT
        const token = jwt.sign(
            { id: voter._id, voter_id: voter.voter_id, role: 'voter' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            voter: {
                name: voter.name,
                voter_id: voter.voter_id,
                has_voted: voter.has_voted
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
