const SiteSettings = require('../models/SiteSettings');

exports.getSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json(settings);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings();
        const allowed = [
            'bannerTitle', 'bannerSubtitle', 'aboutText',
            'contactEmail', 'contactPhone', 'contactAddress',
            'socialFacebook', 'socialTwitter', 'socialLinkedin',
            'socialInstagram', 'socialYoutube', 'footerText'
        ];
        allowed.forEach(key => {
            if (req.body[key] !== undefined) settings[key] = req.body[key];
        });
        settings.updatedAt = new Date();
        await settings.save();
        res.json(settings);
    } catch (err) { res.status(400).json({ error: err.message }); }
};
