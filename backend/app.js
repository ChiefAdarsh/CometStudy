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
    },
    userId: {  // Make sure userId is part of the schema
        type: mongoose.Schema.Types.ObjectId,  // Reference the User model
        ref: 'User',
        required: true,  // Ensure that every session must have a user associated
    },
});

const Session = mongoose.model('Session', sessionSchema);


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

        // Sign a JWT with userId and return it
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});


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
        const decoded = jwt.verify(token, JWT_SECRET);  // Ensure JWT contains userId
        req.user = decoded;  // Attach the decoded JWT payload to req.user (including userId)
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

app.post('/sessions', authenticate, async (req, res) => {
    const { id, latitude, longitude, name, roomNumber, expiryTime } = req.body;
    const userId = req.user.userId;  // Get userId from the authenticated user

    try {
        // Check if the user already has an active session
        const existingSession = await Session.findOne({
            userId: userId,
            expiryTime: { $gt: new Date() }  // Check for non-expired session
        });

        if (existingSession) {
            return res.status(400).json({ error: 'You already have an active study session.' });
        }

        // Create new session associated with the userId
        const newSession = new Session({
            id,
            latitude,
            longitude,
            name,
            roomNumber,
            expiryTime,
            userId: userId  // Associate session with the user
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Failed to add session:', error);
        res.status(500).json({ error: 'Failed to add session due to an internal error.' });
    }
});

// server.js



app.delete('/sessions/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;  // Get the logged-in user's ID from JWT

    try {
        // Find the session to delete
        const session = await Session.findOne({ id });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if the session belongs to the logged-in user
        if (session.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own session' });
        }

        // Delete the session
        await Session.deleteOne({ id });
        res.status(200).json({ message: 'Session deleted successfully' });
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
    const userId = req.user.userId;  // Get the userId from the JWT

    try {
        // Fetch all sessions for display purposes
        const allSessions = await Session.find();

        // Check if the logged-in user has an active (non-expired) session
        const activeSession = await Session.findOne({
            userId: userId,
            expiryTime: { $gt: new Date() }  // Check for non-expired session
        });

        res.json({ allSessions, activeSession });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});
// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});