// AI Service for Frontend Integration
class AIService {
  constructor() {
    this.baseURL = 'http://localhost:4500/api/ai';
  }

  // Chat with AI - supports video context for elaborated answers
  async chat(message, conversationHistory = [], videoContext = "") {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationHistory, videoContext })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  // Analyze FULL Transcript - generates comprehensive notes for the entire video
  async analyzeTranscript(transcriptText, analysisType = "summary", videoTitle = "") {
    try {
      const response = await fetch(`${this.baseURL}/analyze-transcript`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, analysisType, videoTitle })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Analyze Transcript Error:', error);
      throw error;
    }
  }

  // Generate Materials
  async generateMaterials(topic, materialType = "notes", difficulty = "intermediate") {
    try {
      const response = await fetch(`${this.baseURL}/generate-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, materialType, difficulty })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Generate Materials Error:', error);
      throw error;
    }
  }

  // Answer question with full video context - elaborated responses
  async answerQuestion(question, context = "") {
    try {
      const response = await fetch(`${this.baseURL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Answer Question Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  }
}

export default AIService;
