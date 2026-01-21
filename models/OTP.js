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
        default: Date.now,
        expires: 5 * 60,
    },
    mailSent: {
        type: Boolean,
        default: false
    }
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
    const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
    console.log('Attempting to send verification email to:', email);
    const result = await mailSender(email, 'OTP Verification Email', otpTemplate(otp, name));
    console.log('Verification email sent successfully to:', email);
    return result;
}

// Function to send password reset email
async function sendPasswordResetEmail(email, otp) {
    const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
    console.log('Attempting to send password reset email to:', email);
    const result = await mailSender(email, 'Password Reset OTP', passwordResetOtpTemplate(otp, name));
    console.log('Password reset email sent successfully to:', email);
    return result;
}

// Pre-save middleware to send email before saving
OTPSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            if (this.type === 'passwordReset') {
                await sendPasswordResetEmail(this.email, this.otp);
            } else {
                await sendVerificationEmail(this.email, this.otp);
            }
            this.mailSent = true;
        } catch (error) {
            console.error('Failed to send OTP email:', error.message);
            // Still save the OTP even if email fails, but log the error
            this.mailSent = false;
        }
    }
    next();
});

module.exports = mongoose.model('OTP', OTPSchema);