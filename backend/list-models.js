const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();