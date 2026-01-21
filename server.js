// Main server file for LearningEdge backend application
const express = require('express')
const app = express();

// Third-party packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// Database and cloudinary connections
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// Route imports
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const reachRoutes = require('./routes/reach');

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Frontend URL
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp'
    })
)

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
});

// Establish connections
connectDB();
cloudinaryConnect();

// Mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/reach', reachRoutes);

// Default route
app.get('/', (req, res) => {
    res.send(`<div>
    <h1>LearningEdge Backend Server</h1>
    <p>Server is running successfully!</p>
    </div>`);
})