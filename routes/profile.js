// Routes for user profile management
const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");

// Profile controllers
const {
    updateProfile,
    updateUserProfileImage,
    getUserDetails,
    getEnrolledCourses,
    deleteAccount,
    instructorDashboard,
    getPaymentHistory
} = require('../controllers/profile');

// Profile routes
router.delete('/deleteProfile', auth, deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getUserDetails);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateUserProfileImage', auth, updateUserProfileImage);
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);
router.get('/getPaymentHistory', auth, getPaymentHistory);

module.exports = router;
