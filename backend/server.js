const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
