const mongoose = require('mongoose');
require('dotenv').config();

// Cache the database connection for serverless environments
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Function to connect to the MongoDB database
exports.connectDB = async () => {
    // If already connected, return the cached connection
    if (cached.conn) {
        console.log('Using cached database connection');
        return cached.conn;
    }

    // If a connection is in progress, wait for it
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(process.env.DATABASE_URL, opts)
            .then((mongoose) => {
                console.log('Database connected successfully');
                return mongoose;
            })
            .catch((error) => {
                console.log('Error while connecting server with Database');
                console.log(error);
                cached.promise = null;
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
};

