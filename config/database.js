const mongoose = require('mongoose');
require('dotenv').config();

// Function to connect to the MongoDB database
exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting server with Database');
        console.log(error);
        // Don't exit process in serverless environment
        // process.exit(1);
    }
};

