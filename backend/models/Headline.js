const mongoose = require('mongoose');

const headlineSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

headlineSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Headline', headlineSchema);
