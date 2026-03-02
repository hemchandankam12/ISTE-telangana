require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const SiteSettings = require('./models/SiteSettings');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iste_telangana');
        console.log('Connected to MongoDB');

        // Seed admin user
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const existing = await User.findOne({ username });
        if (!existing) {
            await User.create({ username, password });
            console.log(`Admin user "${username}" created successfully.`);
        } else {
            console.log(`Admin "${username}" already exists.`);
        }

        // Seed default site settings
        await SiteSettings.getSettings();
        console.log('Site settings initialized.');

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
