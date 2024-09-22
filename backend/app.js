const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

// MongoDB connection (replace with your MongoDB URI)
const mongoURI = 'mongodb+srv://adarshgoura05:EOmGeNavUFsUqhCP@cluster0.eke0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';  // Use a secure environment variable for this in production

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

// POST /register - Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// POST /login - Login a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
});

// Middleware to authenticate using JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// POST /sessions - Add a new study session (authenticated)
app.post('/sessions', authenticate, async (req, res) => {
    const { id, latitude, longitude, name, roomNumber, expiryTime } = req.body;

    // Validate request body
    if (!id || !latitude || !longitude || !name || !roomNumber || !expiryTime) {
        return res.status(400).json({ error: 'Invalid session data' });
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

        // Save the session to MongoDB
        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add session' });
    }
});

// GET /sessions - Get all study sessions (authenticated)
app.get('/sessions', authenticate, async (req, res) => {
    try {
        const sessions = await Session.find(); // Fetch all sessions from MongoDB
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// DELETE /sessions/:id - Delete a study session (authenticated)
app.delete('/sessions/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const session = await Session.findOneAndDelete({ id });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});