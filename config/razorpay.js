const Razorpay = require('razorpay');
require('dotenv').config();

// Create Razorpay instance for payment processing
exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});