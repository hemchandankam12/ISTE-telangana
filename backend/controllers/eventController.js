const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/events');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});
const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

exports.upload = upload;

exports.getEvents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.upcoming === 'true') filter.isUpcoming = true;
        if (req.query.year) filter.year = parseInt(req.query.year);
        if (req.query.active !== 'false') filter.isActive = true;
        const events = await Event.find(filter).sort({ eventDate: -1 });
        res.json(events);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createEvent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isUpcoming === 'true') data.isUpcoming = true;
        if (data.isUpcoming === 'false') data.isUpcoming = false;
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (data.eventDate) data.year = new Date(data.eventDate).getFullYear();
        if (req.files) {
            if (req.files.coverImage) data.coverImage = '/uploads/events/' + req.files.coverImage[0].filename;
            if (req.files.images) data.images = req.files.images.map(f => '/uploads/events/' + f.filename);
        }
        const event = await Event.create(data);
        res.status(201).json(event);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        const data = { ...req.body };
        if (data.isUpcoming === 'true') data.isUpcoming = true;
        if (data.isUpcoming === 'false') data.isUpcoming = false;
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        if (data.eventDate) data.year = new Date(data.eventDate).getFullYear();
        if (req.files) {
            if (req.files.coverImage) {
                if (event.coverImage) { try { fs.unlinkSync(path.join(__dirname, '../..', event.coverImage)); } catch (e) { } }
                data.coverImage = '/uploads/events/' + req.files.coverImage[0].filename;
            }
            if (req.files.images) {
                const newImages = req.files.images.map(f => '/uploads/events/' + f.filename);
                data.images = [...(event.images || []), ...newImages];
            }
        }
        const updated = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.coverImage) { try { fs.unlinkSync(path.join(__dirname, '../..', event.coverImage)); } catch (e) { } }
        if (event.images) event.images.forEach(img => { try { fs.unlinkSync(path.join(__dirname, '../..', img)); } catch (e) { } });
        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteEventImage = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        const idx = parseInt(req.params.index);
        if (idx >= 0 && idx < event.images.length) {
            try { fs.unlinkSync(path.join(__dirname, '../..', event.images[idx])); } catch (e) { }
            event.images.splice(idx, 1);
            await event.save();
        }
        res.json(event);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
