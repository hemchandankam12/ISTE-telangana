const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eventDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, default: 'Event', trim: true },
    coverImage: { type: String, default: '' },
    images: [{ type: String }],
    isUpcoming: { type: Boolean, default: true },
    year: { type: Number, default: () => new Date().getFullYear() },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

eventSchema.index({ isActive: 1, year: -1, eventDate: -1 });

module.exports = mongoose.model('Event', eventSchema);
