const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['video', 'mentor'], required: true },
    
    // For Video type
    videoId: { type: String, default: "" },
    videoLink: { type: String, default: "" },
    videoTitle: { type: String, default: "YouTube Video" },
    notes: { type: String, default: "" },
    
    // Shared
    chatHistory: [messageSchema]

}, { timestamps: true });

const historyModel = mongoose.model.History || mongoose.model("History", historySchema);
module.exports = historyModel;
