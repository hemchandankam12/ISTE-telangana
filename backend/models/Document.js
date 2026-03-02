const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    filePath: { type: String, required: true },
    fileType: { type: String, default: 'pdf', enum: ['pdf', 'doc', 'xls', 'ppt', 'other'] },
    category: { type: String, default: 'General', trim: true },
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
