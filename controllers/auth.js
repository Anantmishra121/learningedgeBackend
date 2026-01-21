// Import required modules
const User = require('./../models/user');
const Profile = require('./../models/profile');
const optGenerator = require('otp-generator');
const OTP = require('../models/OTP')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookie = require('cookie');
const mailSender = require('../utils/mailSender');
const otpTemplate = require('../mail/templates/emailVerificationTemplate');
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

// ================ SEND-OTP For Email Verification ================
exports.sendOTP = async (req, res) => {
    try {
        // Extract email from request body
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });

        // If user exists, return error
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User is Already Registered'
            })
        }

        // Generate OTP
        const otp = optGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        // Create name from email for email template
        const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');

        // Create OTP entry in database (this will trigger email sending via pre-save middleware)
        const otpBody = await OTP.create({ email, otp, type: 'verification' });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    }

    catch (error) {
        console.log('Error while generating OTP - ', error);
        res.status(500).json({
            success: false,
            message: 'Error while generating OTP',
            error: error.message
        });
    }
}


// ================ SIGNUP ================
exports.signup = async (req, res) => {
    try {
        // Extract data from request body
        const { firstName, lastName, email, password, confirmPassword,
            accountType, contactNumber, otp } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(401).json({
                success: false,
                message: 'All fields are required..!'
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and confirm password do not match, please try again..!'
            });
        }

        // Check if user is already registered
        const checkUserAlreadyExists = await User.findOne({ email });

        // If yes, redirect to login
        if (checkUserAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: 'User registered already, go to Login Page'
            });
        }

        // Find the most recent OTP for the user
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        // Validate OTP existence
        if (!recentOtp || recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found in DB, please try again'
            });
        } else if (otp !== recentOtp.otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
        }

        // Hash the password
        let hashedPassword = await bcrypt.hash(password, 10);

        // Create profile details
        const profileDetails = await Profile.create({
            gender: null, dateOfBirth: null, about: null, contactNumber: null
        });

        // Set approval status based on account type
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Create user entry in database
        const userData = await User.create({
            firstName, lastName, email, password: hashedPassword, contactNumber,
            accountType: accountType, additionalDetails: profileDetails._id,
            approved: approved,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'User Registered Successfully'
        });
    }

    catch (error) {
        console.log('Error while registering user (signup)');
        console.log(error)
        res.status(401).json({
            success: false,
            error: error.message,
            message: 'User cannot be registered, please try again..!'
        })
    }
}


// ================ LOGIN ================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists and fetch details
        let user = await User.findOne({ email }).populate('additionalDetails');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'You are not registered with us'
            });
        }

        // Compare provided password with stored hash
        if (await bcrypt.compare(password, user.password)) {
            // Create JWT payload
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType // Used for authorization checks
            };

            // Generate JWT token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined; // Remove password from response

            // Set cookie options
            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true
            }

            // Send response with token in cookie
            res.cookie('token', token, cookieOptions).status(200).json({
                success: true,
                user,
                token,
                message: 'User logged in successfully'
            });
        }
        else {
            // Password mismatch
            return res.status(401).json({
                success: false,
                message: 'Password not matched'
            });
        }
    }

    catch (error) {
        console.log('Error while logging in user');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while logging in user'
        })
    }
}


// ================ CHANGE PASSWORD ================
exports.changePassword = async (req, res) => {
    try {
        // Extract data from request body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Fetch user details
        const userDetails = await User.findById(req.user.id);

        // Verify old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        // If old password is incorrect
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false, message: "Old password is incorrect"
            });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'The password and confirm password do not match'
            })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
            { password: hashedPassword },
            { new: true });

        // Send password update email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                'Password for your account has been updated',
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
        }
        catch (emailError) {
            console.error("Error occurred while sending email:", emailError);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: emailError.message,
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }

    catch (error) {
        console.log('Error while changing password');
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while changing password'
        })
    }
}