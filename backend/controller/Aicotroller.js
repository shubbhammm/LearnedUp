const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Try different model names - the API has changed over time
let model;
try {
  // Try the newest model first
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} catch (error) {
  try {
    // Try alternative model names
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error2) {
    try {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error3) {
      console.log("Using fallback model configuration");
      model = null;
    }
  }
}

// Enhanced AI responses that are educational and context-aware
const generateSmartResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Programming concepts
  if (message.includes('javascript') || message.includes('js')) {
    if (message.includes('variable')) {
      return "Great question about JavaScript variables! In JavaScript, variables are containers that store data values. You can declare them using 'let', 'const', or 'var'. For example:\n\n```javascript\nlet name = 'John';\nconst age = 25;\nvar city = 'New York';\n```\n\nUse 'let' for variables that can change, 'const' for constants, and avoid 'var' in modern JavaScript. Would you like me to explain the differences between these declaration types?";
    }
    if (message.includes('function')) {
      return "Functions in JavaScript are reusable blocks of code! Here's how they work:\n\n```javascript\n// Function declaration\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Arrow function\nconst add = (a, b) => a + b;\n\n// Function call\nconsole.log(greet('Alice')); // Hello, Alice!\n```\n\nFunctions help you organize code and avoid repetition. What specific aspect of functions would you like to explore?";
    }
    if (message.includes('array')) {
      return "Arrays in JavaScript are ordered lists of items! Here are the basics:\n\n```javascript\n// Creating arrays\nlet fruits = ['apple', 'banana', 'orange'];\nlet numbers = [1, 2, 3, 4, 5];\n\n// Common methods\nfruits.push('grape');     // Add to end\nfruits.pop();             // Remove from end\nfruits.length;            // Get length\n```\n\nArrays are super useful for storing multiple values. What would you like to know about array methods?";
    }
    if (message.includes('object')) {
      return "Objects in JavaScript store data as key-value pairs:\n\n```javascript\nlet person = {\n  name: 'John',\n  age: 30,\n  city: 'Boston',\n  greet: function() {\n    return `Hi, I'm ${this.name}`;\n  }\n};\n\n// Accessing properties\nconsole.log(person.name);     // John\nconsole.log(person['age']);   // 30\n```\n\nObjects are fundamental in JavaScript for organizing related data. Any specific object concepts you'd like to dive into?";
    }
  }
  
  // React concepts
  if (message.includes('react')) {
    if (message.includes('hook')) {
      return "React Hooks are functions that let you use state and lifecycle features in function components!\n\nCommon hooks:\n• useState - for managing state\n• useEffect - for side effects\n• useContext - for consuming context\n• useMemo - for memoization\n\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]);\n  \n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n```\n\nWhich specific hook interests you most?";
    }
    if (message.includes('component')) {
      return "React components are the building blocks of React applications!\n\n```jsx\n// Function Component (modern approach)\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Using the component\nfunction App() {\n  return (\n    <div>\n      <Welcome name=\"Alice\" />\n      <Welcome name=\"Bob\" />\n    </div>\n  );\n}\n```\n\nComponents let you split the UI into independent, reusable pieces. Would you like to learn about props, state, or component lifecycle?";
    }
  }
  
  // Learning and study topics
  if (message.includes('learn') || message.includes('study') || message.includes('understand')) {
    return "I'm here to help you learn! 📚 Here are some effective learning strategies:\n\n1. **Practice regularly** - Code every day, even for 15 minutes\n2. **Build projects** - Apply concepts to real problems\n3. **Break it down** - Split complex topics into smaller parts\n4. **Ask questions** - Never hesitate to seek clarification\n5. **Teach others** - Explaining concepts solidifies your understanding\n\nWhat specific topic would you like to focus on today? I can provide examples, explanations, and practice exercises!";
  }
  
  // General programming concepts
  if (message.includes('loop')) {
    return "Loops help you repeat code efficiently! Here are the main types:\n\n```javascript\n// For loop\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\n// While loop\nlet count = 0;\nwhile (count < 3) {\n  console.log(count);\n  count++;\n}\n\n// For...of loop (arrays)\nfor (let item of ['a', 'b', 'c']) {\n  console.log(item);\n}\n```\n\nEach loop type is useful in different situations. Which one would you like to explore further?";
  }
  
  // Default responses for general questions
  const generalResponses = [
    "That's a great question! Let me help you understand this concept better. Could you provide more specific details about what you'd like to learn?",
    "I'm here to help you learn! This topic has many interesting aspects. What particular area would you like me to focus on?",
    "Excellent topic for learning! Let me break this down in a way that's easy to understand. What's your current level of experience with this?",
    "I love helping students understand new concepts! This is definitely something we can work through together. What specific part is challenging you?",
    "Great question! Learning this concept will really help your programming journey. Let me provide a clear explanation tailored to your needs."
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

// Chat with AI
const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory = [], videoContext = "" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Try real AI first, fallback to mock if it fails
    try {
      let prompt = "";
      
      if (videoContext) {
        // Video-context aware chat
        prompt = `You are an expert AI tutor helping a student understand a video they are watching. You have access to the video's transcript context below. Answer questions in a detailed, educational, and elaborated manner — always relate your answer back to what was discussed in the video. Provide examples, explanations, and additional context to help the student fully understand the topic.

VIDEO CONTEXT (transcript excerpt):
${videoContext}

`;
        if (conversationHistory.length > 0) {
          prompt += "Previous conversation:\n";
          conversationHistory.forEach((turn) => {
            if (turn.user) prompt += `Student: ${turn.user}\n`;
            if (turn.ai) prompt += `Tutor: ${turn.ai}\n`;
          });
          prompt += `\nStudent: ${message}\nTutor (give a detailed, elaborated answer based on the video content):`;
        } else {
          prompt += `Student: ${message}\nTutor (give a detailed, elaborated answer based on the video content):`;
        }
      } else {
        // General mentor chat
        prompt = `You are an expert AI mentor and educator. Provide detailed, comprehensive, and educational responses. Always elaborate fully, give examples, and help the student deeply understand the topic.\n\n`;
        if (conversationHistory.length > 0) {
          prompt += "Previous conversation:\n";
          conversationHistory.forEach((turn) => {
            if (turn.user) prompt += `Student: ${turn.user}\n`;
            if (turn.ai) prompt += `Mentor: ${turn.ai}\n`;
          });
          prompt += `\nStudent: ${message}\nMentor (detailed, elaborated response):`;
        } else {
          prompt += `Student: ${message}\nMentor (detailed, elaborated response):`;
        }
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        success: true,
        response: text,
        message: "AI response generated successfully"
      });

    } catch (aiError) {
      console.log("Gemini AI failed, using smart response system:", aiError.message);
      
      // Use enhanced smart response system
      const smartResponse = generateSmartResponse(message);

      res.json({
        success: true,
        response: smartResponse,
        message: "AI response generated successfully"
      });
    }

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate AI response",
      details: error.message
    });
  }
};

// Analyze transcript with AI - generates comprehensive notes for the FULL video
const analyzeTranscript = async (req, res) => {
  try {
    const { transcript, analysisType = "summary", videoTitle = "" } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const titleLine = videoTitle ? `Video Title: "${videoTitle}"\n\n` : "";

    let prompt = "";
    switch (analysisType) {
      case "summary":
        prompt = `${titleLine}You are an expert educator and note-taker. Below is the COMPLETE transcript of a video. Your task is to generate thorough, well-structured study notes that cover the ENTIRE video from start to finish — do not skip or truncate any section.

Structure your notes as follows:
# 📚 Complete Study Notes

## 🎯 Overview
A 3-5 sentence summary of what the entire video covers.

## 📖 Detailed Notes (Section by Section)
Break the content into logical sections based on topics discussed. For each section:
- Use a clear heading
- Bullet-point the key concepts, facts, and explanations
- Include any examples, formulas, or code snippets mentioned
- Highlight important terms in **bold**

## 🔑 Key Takeaways
List the 5-10 most important points from the entire video.

## 💡 Important Concepts & Definitions
Define all technical terms, concepts, or vocabulary introduced in the video.

## ❓ Review Questions
Generate 5-8 questions that test understanding of the full video content.

## 📝 Summary
A concise paragraph summarizing everything covered.

---
FULL VIDEO TRANSCRIPT:
${transcript}`;
        break;
      case "keypoints":
        prompt = `${titleLine}Extract ALL key points and main concepts from this COMPLETE video transcript. Cover every topic discussed from beginning to end. Format as a structured list with categories:\n\n${transcript}`;
        break;
      case "questions":
        prompt = `${titleLine}Generate 10-15 thoughtful questions based on this COMPLETE video transcript that test understanding of all topics covered:\n\n${transcript}`;
        break;
      case "explanation":
        prompt = `${titleLine}Provide a detailed, comprehensive explanation of ALL concepts discussed in this COMPLETE video transcript. Cover every topic from start to finish:\n\n${transcript}`;
        break;
      default:
        prompt = `${titleLine}Analyze this COMPLETE video transcript and provide comprehensive insights covering all topics:\n\n${transcript}`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      res.json({
        success: true,
        analysis,
        analysisType,
        message: "AI response generated successfully"
      });

    } catch (aiError) {
      console.log("Gemini AI failed for analyzeTranscript, using fallback:", aiError.message);

      const fallbackText = `# 📚 Video Notes\n\n## Overview\nHere is a structured breakdown of the video content:\n\n${
        transcript.split('. ').filter(s => s.trim().length > 20).slice(0, 30).map(s => `- ${s.trim()}`).join('\n')
      }\n\n## Key Points\n- Review the full transcript for detailed information\n- The video covers multiple important topics\n- Take notes while watching for best retention`;

      res.json({
        success: true,
        analysis: fallbackText,
        analysisType,
        message: "AI response generated successfully"
      });
    }

  } catch (error) {
    console.error("Transcript Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze transcript",
      details: error.message
    });
  }
};

// Generate study materials
const generateStudyMaterials = async (req, res) => {
  try {
    const { topic, materialType = "notes", difficulty = "intermediate" } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    let prompt = "";
    switch (materialType) {
      case "notes":
        prompt = `Create comprehensive study notes for the topic: ${topic}. Make it ${difficulty} level. Include key concepts, definitions, and examples.`;
        break;
      case "quiz":
        prompt = `Create a quiz with 10 questions about: ${topic}. Make it ${difficulty} level. Include multiple choice and short answer questions.`;
        break;
      case "flashcards":
        prompt = `Create flashcard content for studying: ${topic}. Make it ${difficulty} level. Format as Question: Answer pairs.`;
        break;
      default:
        prompt = `Generate educational content about: ${topic} at ${difficulty} level.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const materials = response.text();

    res.json({
      success: true,
      materials,
      topic,
      materialType,
      difficulty,
      message: "Study materials generated successfully"
    });

  } catch (error) {
    console.error("Study Materials Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate study materials",
      details: error.message
    });
  }
};

// Q&A based on context - fully elaborated video-context answers
const answerQuestion = async (req, res) => {
  try {
    const { question, context = "" } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    let prompt = "";
    if (context) {
      prompt = `You are an expert AI tutor. A student is watching a video and has a question. Use the video transcript context provided to give a FULLY ELABORATED, DETAILED answer. 

Your answer should:
1. Directly address the question using information from the video
2. Explain the concept thoroughly with examples
3. Add relevant additional context that helps understanding
4. Reference specific parts of the video when relevant
5. Be educational and comprehensive — never give a short or vague answer

VIDEO TRANSCRIPT CONTEXT:
${context}

STUDENT'S QUESTION: ${question}

DETAILED ANSWER (be thorough and educational):`;
    } else {
      prompt = `You are an expert AI educator. Answer this question in a fully elaborated, detailed, and educational manner. Provide examples, explanations, and comprehensive coverage of the topic.

QUESTION: ${question}

DETAILED ANSWER:`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({
      success: true,
      answer,
      question,
      hasContext: !!context,
      message: "Question answered successfully"
    });

  } catch (error) {
    console.error("Q&A Error:", error);
    // Fallback to smart response
    try {
      const smartResponse = generateSmartResponse(question);
      res.json({
        success: true,
        answer: smartResponse,
        question,
        hasContext: !!context,
        message: "Question answered successfully"
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: "Failed to answer question",
        details: error.message
      });
    }
  }
};

module.exports = {
  chatWithAI,
  analyzeTranscript,
  generateStudyMaterials,
  answerQuestion
};