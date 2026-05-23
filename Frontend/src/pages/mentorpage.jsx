import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import AIService from '../services/aiService';
import historyService from '../services/historyService';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FiMic, FiMicOff, FiSend, FiTrash2, FiVolume2 } from 'react-icons/fi';
import Aimentor from '../assets/images/AI Mentor logo.png';
import studentlogo from '../assets/images/Product image.png';

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1">
    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
  </div>
);

const Mentorpage = () => {
  const [conversation, setConversation] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const timeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const aiService = useMemo(() => new AIService(), []);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // ── Load history ──────────────────────────────────────────────────────
  useEffect(() => {
    historyService.getHistory().then(data => {
      if (data.success && data.history) {
        const mentorHistory = data.history.find(h => h.type === 'mentor');
        if (mentorHistory?.chatHistory?.length > 0) {
          setConversation(mentorHistory.chatHistory.map(m => ({
            type: m.sender === 'user' ? 'user' : 'mentor',
            message: m.text,
            timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString()
          })));
        }
      }
    }).catch(console.error).finally(() => setIsLoaded(true));
  }, []);

  // ── Save history ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && conversation.length > 0) {
      historyService.saveSession({
        type: 'mentor',
        chatHistory: conversation.map(c => ({
          sender: c.type === 'user' ? 'user' : 'bot',
          text: c.message
        }))
      }).catch(console.error);
    }
  }, [conversation, isLoaded]);

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isProcessing, transcript]);

  // ── Send to AI ────────────────────────────────────────────────────────
  const handleSendToAI = useCallback(async (userInput) => {
    const trimmed = userInput.trim();
    if (!trimmed || isProcessing) return;

    setIsProcessing(true);
    setConversation(prev => [...prev, {
      type: 'user',
      message: trimmed,
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      const conversationHistory = conversation.map(msg => ({
        user: msg.type === 'user' ? msg.message : '',
        ai: msg.type === 'mentor' ? msg.message : ''
      })).filter(msg => msg.user || msg.ai);

      const response = await aiService.chat(trimmed, conversationHistory);

      setConversation(prev => [...prev, {
        type: 'mentor',
        message: response.success ? response.response : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch {
      setConversation(prev => [...prev, {
        type: 'mentor',
        message: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  }, [isProcessing, conversation, aiService, resetTranscript]);

  // ── Voice: auto-send after 2s silence ────────────────────────────────
  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleSendToAI(transcript);
        setIsListening(false);
        SpeechRecognition.stopListening();
      }, 2000);
      setLastTranscript(transcript);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [transcript, lastTranscript, handleSendToAI]);

  const startListening = () => {
    resetTranscript();
    setLastTranscript('');
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
  };

  const stopListening = () => {
    clearTimeout(timeoutRef.current);
    SpeechRecognition.stopListening();
    setIsListening(false);
    if (transcript?.trim()) {
      handleSendToAI(transcript);
    }
  };

  // ── Text submit ───────────────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    handleSendToAI(textInput);
    setTextInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    resetTranscript();
    setLastTranscript('');
    clearTimeout(timeoutRef.current);
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="card p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Browser Not Supported</h2>
          <p className="text-slate-500 dark:text-slate-400">Your browser doesn't support speech recognition. Try Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Voice-Powered AI Mentor
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
            Your Personal <span className="gradient-text">AI Mentor</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Speak or type your questions. Get detailed, educational answers from your AI tutor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Avatar + Controls ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Avatar Card */}
            <div className="card p-6 text-center space-y-4">
              <div className="relative mx-auto w-fit">
                {/* AI Mentor avatar */}
                <div className={`relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 border-4 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                  isProcessing ? 'border-violet-500 shadow-lg shadow-violet-500/30' :
                  isListening ? 'border-green-500 shadow-lg shadow-green-500/30' :
                  'border-indigo-200 dark:border-indigo-700'
                }`}>
                  <img src={Aimentor} alt="AI Mentor" className="w-24 h-24 object-contain" />
                  {/* Pulse ring when listening */}
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-40" />
                  )}
                </div>
                {/* Student avatar */}
                <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-white shadow-md">
                  <img src={studentlogo} alt="Student" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">AI Mentor</h3>
                <p className={`text-sm font-medium transition-colors ${
                  isProcessing ? 'text-violet-600 dark:text-violet-400' :
                  isListening ? 'text-green-600 dark:text-green-400' :
                  'text-slate-500 dark:text-slate-400'
                }`}>
                  {isProcessing ? '🤔 Thinking...' : isListening ? '🎤 Listening...' : '💬 Ready to help'}
                </p>
              </div>

              {/* Live transcript preview */}
              <AnimatePresence>
                {transcript && isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-left"
                  >
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">🎤 Hearing:</p>
                    <p className="text-sm text-green-800 dark:text-green-300 italic">{transcript}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Controls */}
            <div className="card p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Voice Controls</h4>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30'
                }`}
              >
                {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                {isListening ? 'Stop & Send' : 'Start Speaking'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearConversation}
                disabled={conversation.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear Chat
              </motion.button>
            </div>

            {/* Tips */}
            <div className="card p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tips</h4>
              <ul className="space-y-2">
                {[
                  { icon: '🎤', text: 'Speak clearly, then wait 2s for auto-send' },
                  { icon: '⌨️', text: 'Or type your question below' },
                  { icon: '💡', text: 'Ask follow-up questions for deeper answers' },
                  { icon: '📚', text: 'Ask for examples, explanations, or summaries' },
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="shrink-0">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ── Right: Chat ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 flex flex-col"
            style={{ height: 'calc(100vh - 14rem)', minHeight: '500px' }}
          >
            <div className="card flex flex-col h-full overflow-hidden">

              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg">🧠</div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Mentor Chat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {conversation.length > 0 ? `${conversation.length} messages` : 'Start a conversation'}
                    </p>
                  </div>
                </div>
                {conversation.length > 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {conversation.filter(m => m.type === 'user').length} questions asked
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
                {conversation.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center text-4xl mb-4">🧠</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to Learn!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                      Click "Start Speaking" or type a question below. I'll give you detailed, educational answers.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {['Explain a concept', 'Help me understand...', 'What is...', 'How does...'].map(s => (
                        <button
                          key={s}
                          onClick={() => setTextInput(s + ' ')}
                          className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <AnimatePresence initial={false}>
                      {conversation.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.type === 'mentor' && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm shrink-0 mr-3 mt-1">🧠</div>
                          )}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm bubble-user'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-sm bubble-bot'
                          }`}>
                            {msg.type === 'mentor' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-li:my-0.5">
                                <ReactMarkdown>{msg.message}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            )}
                            <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                              {msg.timestamp}
                            </p>
                          </div>
                          {msg.type === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm shrink-0 ml-3 mt-1">👤</div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm shrink-0 mr-3 mt-1">🧠</div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                          <TypingDots />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Text Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                <form onSubmit={handleTextSubmit} className="flex items-end gap-3">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <textarea
                      ref={textareaRef}
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question here... (Enter to send)"
                      rows={1}
                      disabled={isProcessing}
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none max-h-32 disabled:opacity-50"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isProcessing || !textInput.trim()}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <FiSend className="w-5 h-5" />
                  </motion.button>
                </form>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Shift+Enter</kbd> for new line
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Mentorpage;
