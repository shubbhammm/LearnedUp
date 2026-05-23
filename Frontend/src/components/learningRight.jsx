import React, { useState, useEffect, useRef } from 'react';
import { IoIosSend } from "react-icons/io";
import AIService from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import historyService from '../services/historyService';

const LearningRight = ({ contextData }) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your AI video assistant. Ask me anything about the video you're watching!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const aiService = new AIService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (contextData?.videoId && messages.length > 1) { // Skip saving just the initial greeting
      historyService.saveSession({
        type: 'video',
        videoId: contextData.videoId,
        videoLink: contextData.videoLink,
        chatHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
      }).catch(console.error);
    }
  }, [messages, contextData]);

  const handleInputChange = (e) => setInputText(e.target.value);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setMessages(prev => [...prev, { sender: "user", text: trimmed }]);
    setInputText(""); 
    setIsLoading(true);

    try {
      if (contextData && contextData.transcript && contextData.transcript.length > 0) {
        // Build full transcript string — pass entire video context to AI
        // Cap at 80,000 chars to stay within Gemini limits
        let fullTranscriptText = contextData.transcript
          .map(t => `[${Math.floor(t.start / 60)}:${String(Math.floor(t.start % 60)).padStart(2,'0')}] ${t.text}`)
          .join('\n');
        if (fullTranscriptText.length > 80000) {
          fullTranscriptText = fullTranscriptText.substring(0, 80000) + '\n...[transcript truncated]';
        }

        const contextString = `FULL VIDEO TRANSCRIPT (use this to answer questions accurately and in detail):\n\nCurrent playback time: ${Math.floor((contextData.currentTime || 0) / 60)}:${String(Math.floor((contextData.currentTime || 0) % 60)).padStart(2,'0')}\n\n${fullTranscriptText}`;

        // Build conversation history for multi-turn context
        const conversationHistory = messages
          .filter(m => m.sender !== 'bot' || messages.indexOf(m) > 0) // skip initial greeting
          .map(msg => ({
            user: msg.sender === 'user' ? msg.text : '',
            ai: msg.sender === 'bot' ? msg.text : ''
          })).filter(msg => msg.user || msg.ai);

        const response = await aiService.chat(trimmed, conversationHistory, contextString);
        if (response.success) {
          setMessages(prev => [...prev, { sender: "bot", text: response.response }]);
        } else throw new Error('AI response failed');
      } else {
        // No transcript yet — fallback to general chat
        const conversationHistory = messages.map(msg => ({
          user: msg.sender === 'user' ? msg.text : '',
          ai: msg.sender === 'bot' ? msg.text : ''
        })).filter(msg => msg.user || msg.ai);

        const response = await aiService.chat(trimmed, conversationHistory);
        if (response.success) {
          setMessages(prev => [...prev, { sender: "bot", text: response.response }]);
        } else throw new Error('AI response failed');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I'm having trouble responding right now. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleSend();
    }
  };

  return (
    <div className='p-5 h-full'>
      <div className='bg-white dark:bg-gray-800 h-[calc(100vh-10rem)] w-full border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl flex flex-col overflow-hidden transition-colors duration-300'>

        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-800 p-4 shrink-0 shadow-md z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">AI Buddy</h3>
            <p className="text-indigo-100 text-xs">Based on current video context</p>
          </div>
        </div>

        {/* Chat History */}
        <div className='flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 space-y-4'>
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                }`}>
                  {msg.sender === 'bot' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 shrink-0'>
          {contextData?.currentTime > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                Ref: {Math.floor(contextData.currentTime / 60)}:{String(Math.floor(contextData.currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          )}
          <div className="flex items-end gap-3 bg-gray-100 dark:bg-gray-900 rounded-xl p-2 border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <textarea
              placeholder='Ask about the video...'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
              className={`flex-1 resize-none bg-transparent p-2 max-h-32 text-sm text-gray-900 dark:text-gray-100 focus:outline-none ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                isLoading || !inputText.trim() 
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400' 
                  : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <IoIosSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningRight;
