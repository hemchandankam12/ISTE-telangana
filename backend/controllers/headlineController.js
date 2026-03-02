const Headline = require('../models/Headline');

exports.getHeadlines = async (req, res) => {
    try {
        const filter = req.query.active !== 'false' ? { isActive: true } : {};
        const headlines = await Headline.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(headlines);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createHeadline = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        const h = await Headline.create(data);
        res.status(201).json(h);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateHeadline = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isActive === 'true') data.isActive = true;
        if (data.isActive === 'false') data.isActive = false;
        const h = await Headline.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!h) return res.status(404).json({ error: 'Not found' });
        res.json(h);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteHeadline = async (req, res) => {
    try {
        const h = await Headline.findByIdAndDelete(req.params.id);
        if (!h) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.reorderHeadlines = async (req, res) => {
    try {
        const { items } = req.body; // [{id, order}]
        for (const item of items) {
            await Headline.findByIdAndUpdate(item.id, { order: item.order });
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
