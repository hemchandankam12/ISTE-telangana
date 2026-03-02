require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');
const { verifyToken } = require('./middleware/auth');
const publicRoutes = require('./routes/api');
const adminRoutes = require('./routes/adminApi');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Auth routes ──
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', verifyToken, authController.getProfile);
app.put('/api/auth/password', verifyToken, authController.changePassword);

// ── Public API routes ──
app.use('/api/public', publicRoutes);

// ── Admin API routes (JWT protected) ──
app.use('/api/admin', adminRoutes);

// ── Serve admin panel ──
app.use('/admin', express.static(path.join(__dirname, '../admin-views')));
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-views/index.html'));
});

// ── Serve public frontend ──
app.use(express.static(path.join(__dirname, '../public')));

// SPA-style routes for dynamic pages
app.get('/events/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/event-detail.html')));
app.get('/notices', (req, res) => res.sendFile(path.join(__dirname, '../public/notices.html')));
app.get('/notices/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/notice-detail.html')));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
    if (err.message && err.message.includes('Only')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
});

// Start
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`ISTE Telangana server running on port ${PORT}`);
        console.log(`Public site: http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin/`);
    });
});
