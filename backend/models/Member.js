const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    organization: { type: String, trim: true, default: '' },
    committee: { type: String, default: 'Executive', trim: true },
    year: { type: String, default: new Date().getFullYear().toString() },
    photo: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

memberSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Member', memberSchema);
