// app.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

let studySessions = [];

// GET /sessions - Get all study sessions
app.get('/sessions', (req, res) => {
    res.json(studySessions);
});

// POST /sessions - Add a new study session
app.post('/sessions', (req, res) => {
    const newSession = req.body;
    if (!newSession.id || !newSession.latitude || !newSession.longitude || !newSession.name || !newSession.roomNumber || !newSession.expiryTime) {
        return res.status(400).json({ error: 'Invalid session data' });
    }
    studySessions.push(newSession);
    res.status(201).json(newSession);
});

// DELETE /sessions/:id - Delete a study session
app.delete('/sessions/:id', (req, res) => {
    const id = req.params.id;
    const index = studySessions.findIndex(session => session.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Session not found' });
    }
    const deletedSession = studySessions.splice(index, 1);
    res.json(deletedSession[0]);
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});