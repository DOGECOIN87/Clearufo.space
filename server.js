const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for the frontend
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:8888',
        'http://localhost:3000',
        'https://clearufo.space'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Serve static files
app.use(express.static('.'));

// Store visits in a JSON file
const VISITS_FILE = 'visits.json';

// Initialize visits file if it doesn't exist
async function initVisitsFile() {
    try {
        await fs.access(VISITS_FILE);
    } catch {
        await fs.writeFile(VISITS_FILE, JSON.stringify({ count: 0 }));
    }
}

// Get current visit count
app.get('/api/visits', async (req, res) => {
    try {
        const data = await fs.readFile(VISITS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read visit count' });
    }
});

// Increment visit count
app.post('/api/visits', async (req, res) => {
    try {
        const data = await fs.readFile(VISITS_FILE, 'utf8');
        const visits = JSON.parse(data);
        visits.count += 1;
        await fs.writeFile(VISITS_FILE, JSON.stringify(visits));
        res.json(visits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update visit count' });
    }
});

// Initialize and start server
async function start() {
    await initVisitsFile();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

start();
