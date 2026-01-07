const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// CORS Configuration - Allow your Vercel frontend (all deployments)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        if (!origin) return callback(null, true);

        // List of allowed origin patterns
        const allowedPatterns = [
            /^https:\/\/weather-app.*\.vercel\.app$/,  // All Vercel deployments
            /^http:\/\/localhost:\d+$/,                 // Any localhost port
            /^http:\/\/127\.0\.0\.1:\d+$/              // Any 127.0.0.1 port
        ];

        // Check if origin matches any pattern
        const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Main weather endpoint
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, q, units = 'metric' } = req.query;
        let url;

        if (q) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=${units}&appid=${API_KEY}`;
        } else if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        } else {
            return res.status(400).json({ error: 'Missing location parameters' });
        }

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch weather data' });
    }
});

// Forecast endpoint
app.get('/api/forecast', async (req, res) => {
    try {
        const { lat, lon, q, units = 'metric' } = req.query;
        let url;

        if (q) {
            url = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=${units}&appid=${API_KEY}`;
        } else if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        } else {
            return res.status(400).json({ error: 'Missing location parameters' });
        }

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching forecast:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch forecast data' });
    }
});

// Nearby cities endpoint
app.get('/api/nearby', async (req, res) => {
    try {
        const { lat, lon, cnt = 6, units = 'metric' } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing lat/lon parameters' });
        }

        // Uses OpenWeatherMap's "Find cities in circle" API
        const url = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=${cnt}&units=${units}&appid=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching nearby cities:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch nearby cities' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
