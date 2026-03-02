const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const noticeController = require('../controllers/noticeController');
const headlineController = require('../controllers/headlineController');
const memberController = require('../controllers/memberController');
const galleryController = require('../controllers/galleryController');
const documentController = require('../controllers/documentController');
const settingsController = require('../controllers/settingsController');
const awardController = require('../controllers/awardController');

// Public event routes
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEvent);

// Public announcement routes
router.get('/announcements', noticeController.getAnnouncements);
router.get('/announcements/:id', noticeController.getAnnouncement);

// Public headline routes
router.get('/headlines', headlineController.getHeadlines);

// Public member routes
router.get('/members', memberController.getMembers);
router.get('/members/:id', memberController.getMember);

// Public gallery routes
router.get('/gallery', galleryController.getGalleries);
router.get('/gallery/:id', galleryController.getGallery);

// Public document routes
router.get('/documents', documentController.getDocuments);
router.get('/documents/:id', documentController.getDocument);
router.post('/documents/:id/download', documentController.downloadDocument);

// Public award routes
router.get('/awards', awardController.getAwards);
router.get('/awards/:id', awardController.getAward);

// Public settings
router.get('/settings', settingsController.getSettings);

module.exports = router;
