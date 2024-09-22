const mongoose = require('mongoose');

// Define the schema for a study session
const sessionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    roomNumber: {
        type: String,
        required: true,
    },
    expiryTime: {
        type: Date,
        required: true,
    }
});

// Create a model based on the schema
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;