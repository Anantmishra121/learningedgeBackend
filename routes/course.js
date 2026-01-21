// Routes for course management, categories, sections, subsections, and ratings
const express = require('express');
const router = express.Router();

// Course controllers
const {
    createCourse,
    getCourseDetails,
    getAllCourses,
    getFullCourseDetails,
    editCourse,
    deleteCourse,
    getInstructorCourses,
} = require('../controllers/course')

const { updateCourseProgress } = require('../controllers/courseProgress')

// Category controllers
const {
    createCategory,
    showAllCategories,
    getCategoryPageDetails,
    deleteCategory,
} = require('../controllers/category');

// Section controllers
const {
    createSection,
    updateSection,
    deleteSection,
} = require('../controllers/section');

// Subsection controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/subSection');

// Rating controllers
const {
    createRating,
    getAverageRating,
    getAllRatingReview
} = require('../controllers/ratingAndReview');

// Middleware
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth')

// Course routes
router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/addSection', auth, isInstructor, createSection);
router.post('/updateSection', auth, isInstructor, updateSection);
router.post('/deleteSection', auth, isInstructor, deleteSection);
router.post('/addSubSection', auth, isInstructor, createSubSection);
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);
router.post('/getCourseDetails', getCourseDetails);
router.get('/getAllCourses', getAllCourses);
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.post("/editCourse", auth, isInstructor, editCourse)
router.delete("/deleteCourse", auth, isInstructor, deleteCourse)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// Category routes (Admin only)
router.post('/createCategory', auth, isAdmin, createCategory);
router.delete('/deleteCategory', auth, isAdmin, deleteCategory);
router.get('/showAllCategories', showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails)

// Rating and Review routes
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatingReview);

module.exports = router;