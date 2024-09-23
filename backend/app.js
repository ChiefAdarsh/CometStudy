require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Mongoose User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Mongoose Session schema and model
const sessionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    name: { type: String, required: true },
    roomNumber: { type: String, required: true },
    expiryTime: { type: Date, required: true }
});

const Session = mongoose.model('Session', sessionSchema);

// POST /login - Login a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Middleware to authenticate using JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied, malformed token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// POST /sessions - Add a new study session (authenticated)
app.post('/sessions', authenticate, async (req, res) => {
    const { id, latitude, longitude, name, roomNumber, expiryTime } = req.body;

    console.log('Received Session Data:', req.body);  // Log the incoming session data

    if (!id || !latitude || !longitude || !name || !roomNumber || !expiryTime) {
        return res.status(400).json({ error: 'Invalid session data. All fields are required.' });
    }

    try {
        const newSession = new Session({
            id,
            latitude,
            longitude,
            name,
            roomNumber,
            expiryTime
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Failed to add session:', error);
        res.status(500).json({ error: 'Failed to add session due to an internal error.' });
    }
});

// server.js

// DELETE /sessions/:id - Delete a study session (authenticated)
app.delete('/sessions/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Session.deleteOne({ id: id });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Session deleted successfully' });
        } else {
            res.status(404).json({ message: 'Session not found' });
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Failed to delete session', error });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Optionally, generate a JWT token for immediate login
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error registering new user:', error);
        res.status(500).json({ message: 'Failed to register user', error });
    }
});

// GET /sessions - Fetch all study sessions (authenticated)
app.get('/sessions', authenticate, async (req, res) => {
    try {
        const sessions = await Session.find();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});