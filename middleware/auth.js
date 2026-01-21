// Middleware for authentication and role-based access control

const jwt = require("jsonwebtoken");
require('dotenv').config();

// ================ AUTHENTICATION MIDDLEWARE ================
// Middleware to authenticate users by verifying JWT token
exports.auth = (req, res, next) => {
    try {
        // Extract token from request body, cookies, or Authorization header
        const token = req.body?.token || req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

        // Check if token is missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is Missing'
            });
        }

        // Verify the JWT token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode; // Attach decoded user data to request object
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: error.message,
                message: 'Error while decoding token'
            });
        }

        // Proceed to next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error while token validating'
        });
    }
};

// ================ STUDENT ROLE MIDDLEWARE ================
// Middleware to check if the authenticated user has Student role
exports.isStudent = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Student') {
            return res.status(401).json({
                success: false,
                message: 'This page is protected for students only'
            });
        }
        // Proceed to next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity for student account type'
        });
    }
};

// ================ INSTRUCTOR ROLE MIDDLEWARE ================
// Middleware to check if the authenticated user has Instructor role
exports.isInstructor = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: 'This page is protected for instructors only'
            });
        }
        // Proceed to next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity for instructor account type'
        });
    }
};

// ================ ADMIN ROLE MIDDLEWARE ================
// Middleware to check if the authenticated user has Admin role
exports.isAdmin = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'This page is protected for admins only'
            });
        }
        // Proceed to next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity for admin account type'
        });
    }
};


