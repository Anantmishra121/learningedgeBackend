// Model for OTP (One-Time Password) verification
const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const otpTemplate = require('../mail/templates/emailVerificationTemplate');
const passwordResetOtpTemplate = require('../mail/templates/passwordResetOtpTemplate');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['verification', 'passwordReset'],
        default: 'verification'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60, // The document will be automatically deleted after 5 minutes of its creation time
    }

});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
    try {
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        const mailResponse = mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));
    } catch (error) {
        throw error;
    }
}

// Function to send password reset email
async function sendPasswordResetEmail(email, otp) {
    try {
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        const mailResponse = mailSender(email, 'Password Reset OTP', passwordResetOtpTemplate(otp, name));
    } catch (error) {
        throw error;
    }
}

// Pre-save middleware to send email when new OTP is created
OTPSchema.pre('save', async function(next) {
    // Only send an email when a new document is created
    if (this.isNew) {
        if (this.type === 'passwordReset') {
            await sendPasswordResetEmail(this.email, this.otp);
        } else {
            await sendVerificationEmail(this.email, this.otp);
        }
    }
    next();
});

module.exports = mongoose.model('OTP', OTPSchema);