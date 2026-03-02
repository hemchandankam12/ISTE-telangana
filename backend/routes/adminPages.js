const express = require('express');
const path = require('path');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const adminViewsDir = path.join(__dirname, '../../admin-views');

// Login page (no auth required)
router.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(adminViewsDir, 'login.html'));
});

// All routes below require auth
router.use(requireAuth);

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'dashboard.html'));
});

router.get('/events', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'events.html'));
});

router.get('/events/new', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'event-form.html'));
});

router.get('/events/edit/:id', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'event-form.html'));
});

router.get('/notices', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'notices.html'));
});

router.get('/notices/new', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'notice-form.html'));
});

router.get('/notices/edit/:id', (req, res) => {
    res.sendFile(path.join(adminViewsDir, 'notice-form.html'));
});

module.exports = router;
