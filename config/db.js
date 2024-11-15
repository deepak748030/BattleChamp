const mongoose = require('mongoose')

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://deepakkushwah748930:Deepak900@cluster0.0nhxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB connected');

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        setTimeout(connectDB, 5000);
        console.log('reconnecting after 5 seconds')
    }
};

module.exports = connectDB;
