const mongoose = require('mongoose')

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        setTimeout(connectDB, 5000);
        console.log('reconnecting after 5 seconds')
    }
};

module.exports = connectDB;