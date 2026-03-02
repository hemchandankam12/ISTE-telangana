const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    pdfPath: { type: String, default: '' },
    priority: { type: String, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, default: null },
    publishDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

announcementSchema.index({ isActive: 1, priority: 1, publishDate: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
