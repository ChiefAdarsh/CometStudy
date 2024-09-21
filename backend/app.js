// backend/app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for pins (for now, use a database like MongoDB for production)
let pins = [];

// Get all pins
app.get('/pins', (req, res) => {
    res.json(pins);
});

// Add a new pin
app.post('/pins', (req, res) => {
    const { latitude, longitude, name } = req.body;
    const newPin = { latitude, longitude, name };
    pins.push(newPin);
    res.status(201).json(newPin);
});

// Delete a pin
app.delete('/pins/:index', (req, res) => {
    const index = req.params.index;
    if (index < 0 || index >= pins.length) {
        return res.status(404).json({ error: 'Invalid index' });
    }
    const removedPin = pins.splice(index, 1);
    res.status(200).json(removedPin);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});