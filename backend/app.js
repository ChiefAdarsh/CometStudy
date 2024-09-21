require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('CometRoute Backend Server');
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});


app.get('/geocode', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                key: process.env.OPENCAGE_API_KEY,
                q: address,
                limit: 1,
            },
        });

        if (response.data.results.length === 0) {
            return res.status(404).json({ error: 'No results found' });
        }

        const location = response.data.results[0].geometry;
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Geocoding request failed' });
    }
});

