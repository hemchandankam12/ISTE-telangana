const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    awardType: { type: String, required: true, enum: ['Best Teacher', 'Best Student', 'Best College', 'Lifetime Achievement', 'Best Chapter', 'Best Researcher', 'Other'], default: 'Best Teacher' },
    description: { type: String, default: '' },
    year: { type: Number, required: true, default: new Date().getFullYear() },
    pdfPath: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

awardSchema.index({ isActive: 1, year: -1, order: 1 });

module.exports = mongoose.model('Award', awardSchema);
