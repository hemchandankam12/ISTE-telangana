const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Award = require('../models/Award');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/awards');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
exports.upload = upload;

exports.getAwards = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active !== 'false') filter.isActive = true;
        if (req.query.year) filter.year = parseInt(req.query.year);
        if (req.query.type) filter.awardType = req.query.type;
        const awards = await Award.find(filter).sort({ year: -1, order: 1 });
        res.json(awards);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getAward = async (req, res) => {
    try {
        const a = await Award.findById(req.params.id);
        if (!a) return res.status(404).json({ error: 'Not found' });
        res.json(a);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createAward = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (data.year) data.year = parseInt(data.year);
        if (req.file) data.pdfPath = '/uploads/awards/' + req.file.filename;
        const a = await Award.create(data);
        res.status(201).json(a);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateAward = async (req, res) => {
    try {
        const existing = await Award.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (data.year) data.year = parseInt(data.year);
        if (req.file) {
            if (existing.pdfPath) { try { fs.unlinkSync(path.join(__dirname, '../..', existing.pdfPath)); } catch (e) { } }
            data.pdfPath = '/uploads/awards/' + req.file.filename;
        }
        const a = await Award.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(a);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteAward = async (req, res) => {
    try {
        const a = await Award.findById(req.params.id);
        if (!a) return res.status(404).json({ error: 'Not found' });
        if (a.pdfPath) { try { fs.unlinkSync(path.join(__dirname, '../..', a.pdfPath)); } catch (e) { } }
        await Award.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
