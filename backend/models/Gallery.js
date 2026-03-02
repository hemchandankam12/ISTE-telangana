const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    eventRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    images: [{ type: String }],
    coverImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
