const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/documents');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')); }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
exports.upload = upload;

exports.getDocuments = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active !== 'false') filter.isActive = true;
        if (req.query.category) filter.category = req.query.category;
        const docs = await Document.find(filter).sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Not found' });
        res.json(doc);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.downloadDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Not found' });
        doc.downloadCount += 1;
        await doc.save();
        res.json({ downloadUrl: doc.filePath, downloadCount: doc.downloadCount });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createDocument = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) data.filePath = '/uploads/documents/' + req.file.filename;
        else return res.status(400).json({ error: 'File is required' });
        const doc = await Document.create(data);
        res.status(201).json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateDocument = async (req, res) => {
    try {
        const existing = await Document.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.file) {
            if (existing.filePath) { try { fs.unlinkSync(path.join(__dirname, '../..', existing.filePath)); } catch (e) { } }
            data.filePath = '/uploads/documents/' + req.file.filename;
        }
        const doc = await Document.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(doc);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Not found' });
        if (doc.filePath) { try { fs.unlinkSync(path.join(__dirname, '../..', doc.filePath)); } catch (e) { } }
        await Document.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
