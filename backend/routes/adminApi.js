const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const eventController = require('../controllers/eventController');
const noticeController = require('../controllers/noticeController');
const headlineController = require('../controllers/headlineController');
const memberController = require('../controllers/memberController');
const galleryController = require('../controllers/galleryController');
const documentController = require('../controllers/documentController');
const settingsController = require('../controllers/settingsController');
const awardController = require('../controllers/awardController');

// All admin API routes require JWT authentication
router.use(verifyToken);

// ── Events ──
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEvent);
router.post('/events', eventController.upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 20 }
]), eventController.createEvent);
router.put('/events/:id', eventController.upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 20 }
]), eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.delete('/events/:id/images/:index', eventController.deleteEventImage);

// ── Announcements ──
router.get('/announcements', noticeController.getAnnouncements);
router.get('/announcements/:id', noticeController.getAnnouncement);
router.post('/announcements', noticeController.upload.single('pdf'), noticeController.createAnnouncement);
router.put('/announcements/:id', noticeController.upload.single('pdf'), noticeController.updateAnnouncement);
router.delete('/announcements/:id', noticeController.deleteAnnouncement);

// ── Headlines ──
router.get('/headlines', headlineController.getHeadlines);
router.post('/headlines', headlineController.createHeadline);
router.put('/headlines/:id', headlineController.updateHeadline);
router.delete('/headlines/:id', headlineController.deleteHeadline);
router.put('/headlines/reorder', headlineController.reorderHeadlines);

// ── Members ──
router.get('/members', memberController.getMembers);
router.get('/members/:id', memberController.getMember);
router.post('/members', memberController.upload.single('photo'), memberController.createMember);
router.put('/members/:id', memberController.upload.single('photo'), memberController.updateMember);
router.delete('/members/:id', memberController.deleteMember);

// ── Gallery ──
router.get('/gallery', galleryController.getGalleries);
router.get('/gallery/:id', galleryController.getGallery);
router.post('/gallery', galleryController.upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 30 }
]), galleryController.createGallery);
router.put('/gallery/:id', galleryController.upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 30 }
]), galleryController.updateGallery);
router.delete('/gallery/:id', galleryController.deleteGallery);
router.delete('/gallery/:id/images/:index', galleryController.deleteGalleryImage);

// ── Documents ──
router.get('/documents', documentController.getDocuments);
router.get('/documents/:id', documentController.getDocument);
router.post('/documents', documentController.upload.single('file'), documentController.createDocument);
router.put('/documents/:id', documentController.upload.single('file'), documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

// ── Site Settings ──
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

// ── Awards ──
router.get('/awards', awardController.getAwards);
router.get('/awards/:id', awardController.getAward);
router.post('/awards', awardController.upload.single('pdf'), awardController.createAward);
router.put('/awards/:id', awardController.upload.single('pdf'), awardController.updateAward);
router.delete('/awards/:id', awardController.deleteAward);

module.exports = router;
