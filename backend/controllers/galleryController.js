const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/gallery');
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

exports.getGalleries = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active !== 'false') filter.isActive = true;
        if (req.query.category) filter.category = req.query.category;
        const galleries = await Gallery.find(filter).sort({ createdAt: -1 });
        res.json(galleries);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getGallery = async (req, res) => {
    try {
        const g = await Gallery.findById(req.params.id);
        if (!g) return res.status(404).json({ error: 'Not found' });
        res.json(g);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createGallery = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.files) {
            if (req.files.coverImage) data.coverImage = '/uploads/gallery/' + req.files.coverImage[0].filename;
            if (req.files.images) data.images = req.files.images.map(f => '/uploads/gallery/' + f.filename);
        }
        const g = await Gallery.create(data);
        res.status(201).json(g);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateGallery = async (req, res) => {
    try {
        const existing = await Gallery.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (req.files) {
            if (req.files.coverImage) {
                if (existing.coverImage) { try { fs.unlinkSync(path.join(__dirname, '../..', existing.coverImage)); } catch (e) { } }
                data.coverImage = '/uploads/gallery/' + req.files.coverImage[0].filename;
            }
            if (req.files.images) {
                const newImages = req.files.images.map(f => '/uploads/gallery/' + f.filename);
                data.images = [...(existing.images || []), ...newImages];
            }
        }
        const g = await Gallery.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(g);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteGallery = async (req, res) => {
    try {
        const g = await Gallery.findById(req.params.id);
        if (!g) return res.status(404).json({ error: 'Not found' });
        if (g.coverImage) { try { fs.unlinkSync(path.join(__dirname, '../..', g.coverImage)); } catch (e) { } }
        if (g.images) g.images.forEach(img => { try { fs.unlinkSync(path.join(__dirname, '../..', img)); } catch (e) { } });
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteGalleryImage = async (req, res) => {
    try {
        const g = await Gallery.findById(req.params.id);
        if (!g) return res.status(404).json({ error: 'Not found' });
        const idx = parseInt(req.params.index);
        if (idx >= 0 && idx < g.images.length) {
            try { fs.unlinkSync(path.join(__dirname, '../..', g.images[idx])); } catch (e) { }
            g.images.splice(idx, 1);
            await g.save();
        }
        res.json(g);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
