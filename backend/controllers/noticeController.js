const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Announcement = require('../models/Notice');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/notices');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
exports.upload = upload;

exports.getAnnouncements = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active !== 'false') {
            filter.isActive = true;
            filter.$or = [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }];
        }
        const announcements = await Announcement.find(filter).sort({ priority: -1, publishDate: -1 });
        res.json(announcements);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Not found' });
        res.json(announcement);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) data.pdfPath = '/uploads/notices/' + req.file.filename;
        const a = await Announcement.create(data);
        res.status(201).json(a);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const existing = await Announcement.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) {
            if (existing.pdfPath) { try { fs.unlinkSync(path.join(__dirname, '../..', existing.pdfPath)); } catch (e) { } }
            data.pdfPath = '/uploads/notices/' + req.file.filename;
        }
        const updated = await Announcement.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const a = await Announcement.findById(req.params.id);
        if (!a) return res.status(404).json({ error: 'Not found' });
        if (a.pdfPath) { try { fs.unlinkSync(path.join(__dirname, '../..', a.pdfPath)); } catch (e) { } }
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
