// Import required modules
const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const OTP = require('../models/OTP');

// ================ SEND OTP FOR PASSWORD RESET ================
exports.resetPasswordToken = async (req, res) => {
    try {
        // Extract email from request body
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Your Email is not registered with us'
            });
        }

        // Generate OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // Create name from email for email template
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');

        // Create OTP entry in database (this will trigger email sending via pre-save middleware)
        const otpBody = await OTP.create({ email, otp, type: 'passwordReset' });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully, please check your email and enter the OTP to reset your password'
        });
    }

    catch (error) {
        console.log('Error while sending OTP for password reset');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while sending OTP for password reset'
        });
    }
}

// ================ RESET PASSWORD WITH OTP ================
exports.resetPassword = async (req, res) => {
    try {
        // Extract data from request body
        const { email, otp, password, confirmPassword } = req.body;

        // Validate required fields
        if (!email || !otp || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "All fields are required...!"
            });
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Find the most recent OTP for the user
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        // Validate OTP existence
        if (!recentOtp) {
            return res.status(401).json({
                success: false,
                message: 'OTP not found or expired'
            });
        }

        // Validate OTP matches
        if (otp !== recentOtp.otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in database
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        // Delete the used OTP
        await OTP.deleteMany({ email });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    }

    catch (error) {
        console.log('Error while resetting password');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while resetting password'
        });
    }
}