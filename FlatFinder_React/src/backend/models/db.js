const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/authApp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connectDB;