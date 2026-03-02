const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    bannerTitle: { type: String, default: 'Empowering Technical Education in Telangana' },
    bannerSubtitle: { type: String, default: 'Indian Society for Technical Education - Telangana Chapter. Building a community of innovators, educators, and technical professionals.' },
    aboutText: { type: String, default: '' },
    contactEmail: { type: String, default: 'istetelangana@gmail.com' },
    contactPhone: { type: String, default: '+91 98765 43210' },
    contactAddress: { type: String, default: '' },
    socialFacebook: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    socialLinkedin: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialYoutube: { type: String, default: '' },
    footerText: { type: String, default: 'ISTE Telangana - Promoting technical excellence in education.' },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure only one settings document exists (singleton pattern)
siteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
