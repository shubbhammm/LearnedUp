const express = require("express");
const {
  chatWithAI,
  analyzeTranscript,
  generateStudyMaterials,
  answerQuestion
} = require("../controller/Aicotroller");

const aiRouter = express.Router();

// Chat with AI
aiRouter.post("/chat", chatWithAI);

// Analyze transcript
aiRouter.post("/analyze-transcript", analyzeTranscript);

// Generate study materials
aiRouter.post("/generate-materials", generateStudyMaterials);

// Answer questions
aiRouter.post("/answer", answerQuestion);

// Health check for AI service
aiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AI service is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = aiRouter;