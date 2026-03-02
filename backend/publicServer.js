require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const publicRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PUBLIC_PORT || 3000;

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public API routes
app.use('/api/public', publicRoutes);

// Serve public frontend
app.use(express.static(path.join(__dirname, '../public')));

// SPA-style routes
app.get('/events/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/event-detail.html')));
app.get('/notices', (req, res) => res.sendFile(path.join(__dirname, '../public/notices.html')));
app.get('/notices/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/notice-detail.html')));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Public site running on port ${PORT}`);
    });
});
