require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const { verifyToken } = require('./middleware/auth');
const adminRoutes = require('./routes/adminApi');

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
// Only allow CORS from the public site (not open to all)
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (needed for admin previews)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Auth routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', verifyToken, authController.getProfile);
app.put('/api/auth/password', verifyToken, authController.changePassword);

// Admin API routes (JWT protected)
app.use('/api/admin', adminRoutes);

// Public API proxy (so admin panel can fetch stats)
const publicRoutes = require('./routes/api');
app.use('/api/public', publicRoutes);

// Serve admin panel SPA
app.use(express.static(path.join(__dirname, '../admin-views')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-views/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Admin error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
    if (err.message && err.message.includes('Only')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
});

// Start
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Admin panel running on port ${PORT} (internal only)`);
    });
});
