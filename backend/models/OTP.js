const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp_code: { type: String, required: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } } // Document will expire at this time
});

module.exports = mongoose.model('OTP', otpSchema);
