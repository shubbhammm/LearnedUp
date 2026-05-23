const History = require('../schemas/historySchema');

// Get all history for current user
const getHistory = async (req, res) => {
    try {
        const history = await History.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json({ success: true, history });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Save or Update a session
const saveSession = async (req, res) => {
    try {
        const { type, videoId, videoLink, videoTitle, notes, chatHistory } = req.body;
        
        let session;

        // If it's a video type, check if a session for this video already exists for the user
        if (type === 'video' && videoId) {
            session = await History.findOne({ userId: req.user._id, videoId, type: 'video' });
        } else if (type === 'mentor') {
            // Mentor might just be a single persistent session per user or multiple, but let's just use one massive session per user for simplicity, or grab the latest.
            // Let's find the latest mentor session
            session = await History.findOne({ userId: req.user._id, type: 'mentor' }).sort({ updatedAt: -1 });
        }

        if (session) {
            // Update existing
            if (notes) session.notes = notes;
            if (chatHistory) session.chatHistory = chatHistory;
            if (videoTitle) session.videoTitle = videoTitle;
            session.updatedAt = new Date();
            await session.save();
        } else {
            // Create new
            session = new History({
                userId: req.user._id,
                type,
                videoId: videoId || "",
                videoLink: videoLink || "",
                videoTitle: videoTitle || (type === 'mentor' ? "AI Mentor Session" : "YouTube Video"),
                notes: notes || "",
                chatHistory: chatHistory || []
            });
            await session.save();
        }

        res.json({ success: true, session });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
    getHistory,
    saveSession
};
