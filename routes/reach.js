// Routes for contact/reach out functionality
const express = require('express');
const router = express.Router();

// Import contact controller
const { contactUs } = require('../controllers/contactUs');

// Contact form submission route (public - no auth required)
router.post('/contact', contactUs);

module.exports = router;
