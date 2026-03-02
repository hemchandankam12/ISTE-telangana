const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Member = require('../models/Member');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/members');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); }
});
const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.upload = upload;

exports.getMembers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active !== 'false') filter.isActive = true;
        if (req.query.committee) filter.committee = req.query.committee;
        if (req.query.year) filter.year = req.query.year;
        const members = await Member.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(members);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getMember = async (req, res) => {
    try {
        const m = await Member.findById(req.params.id);
        if (!m) return res.status(404).json({ error: 'Not found' });
        res.json(m);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createMember = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) data.photo = '/uploads/members/' + req.file.filename;
        const m = await Member.create(data);
        res.status(201).json(m);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateMember = async (req, res) => {
    try {
        const existing = await Member.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) {
            if (existing.photo) { try { fs.unlinkSync(path.join(__dirname, '../..', existing.photo)); } catch (e) { } }
            data.photo = '/uploads/members/' + req.file.filename;
        }
        const m = await Member.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(m);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteMember = async (req, res) => {
    try {
        const m = await Member.findById(req.params.id);
        if (!m) return res.status(404).json({ error: 'Not found' });
        if (m.photo) { try { fs.unlinkSync(path.join(__dirname, '../..', m.photo)); } catch (e) { } }
        await Member.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
