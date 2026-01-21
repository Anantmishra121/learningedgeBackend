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
        default: Date.now, // Remove parentheses - use function reference, not function call
        expires: 5 * 60, // The document will be automatically deleted after 5 minutes of its creation time
    }

});

// Function to send verification email (non-blocking)
async function sendVerificationEmail(email, otp) {
    try {
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        await mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));
        console.log('Verification email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't throw - let the OTP save succeed even if email fails
    }
}

// Function to send password reset email (non-blocking)
async function sendPasswordResetEmail(email, otp) {
    try {
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        await mailSender(email, 'Password Reset OTP', passwordResetOtpTemplate(otp, name));
        console.log('Password reset email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        // Don't throw - let the OTP save succeed even if email fails
    }
}

// Post-save middleware to send email AFTER OTP is saved (non-blocking)
OTPSchema.post('save', function(doc) {
    // Send email asynchronously without blocking the response
    if (doc.type === 'passwordReset') {
        sendPasswordResetEmail(doc.email, doc.otp);
    } else {
        sendVerificationEmail(doc.email, doc.otp);
    }
});

module.exports = mongoose.model('OTP', OTPSchema);