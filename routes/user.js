// Routes for user authentication and management
const express = require('express');
const router = express.Router();

// Authentication controllers
const {
    signup,
    login,
    sendOTP,
    changePassword
} = require('../controllers/auth');

// Password reset controllers
const {
    resetPasswordToken,
    resetPassword,
} = require('../controllers/resetPassword');

// Middleware
const { auth, isAdmin } = require('../middleware/auth');
const { getAllStudents, getAllInstructors } = require('../controllers/profile');

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/sendotp', sendOTP);
router.post('/changepassword', auth, changePassword);

// Password reset routes
router.post('/reset-password-token', resetPasswordToken);
router.post("/reset-password", resetPassword);

// Admin routes
router.get("/all-students", auth, isAdmin, getAllStudents)
router.get("/all-instructors", auth, isAdmin, getAllInstructors)

module.exports = router
