import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const InputField = ({ label, name, type, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
    </label>
    <input
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 input-ring text-sm transition-all"
    />
  </div>
);

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password);

      if (result.success) {
        setMessage({ text: result.message || 'Success!', type: 'success' });
        setTimeout(() => navigate('/'), 1200);
      } else {
        setMessage({ text: result.message || 'Something went wrong', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
    >
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">L</div>
            <span className="text-2xl font-black">LearnedUp</span>
          </Link>

          <div className="space-y-6 max-w-sm">
            <h2 className="text-4xl font-black leading-tight">
              Your AI-Powered<br />Learning Journey<br />Starts Here
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Join thousands of students transforming how they learn from videos.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { icon: '📝', text: 'AI-generated notes for full videos' },
                { icon: '💬', text: 'Chat with your video in real-time' },
                { icon: '🧠', text: 'Voice-powered AI mentor' },
                { icon: '📊', text: 'Track your learning history' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-base shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm text-indigo-100 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-lg">L</div>
            <span className="text-xl font-black gradient-text">LearnedUp</span>
          </div>

          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {isLogin ? 'Welcome back 👋' : 'Create account ✨'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {isLogin ? "Sign in to continue your learning journey" : "Join thousands of learners today"}
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
              {['Sign In', 'Sign Up'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setFormData({ name: '', email: '', password: '' }); setMessage(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    (i === 0) === isLogin
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <InputField
                      label="Full Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${
                      message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}
                  >
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all shadow-lg ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/30 hover:shadow-indigo-500/50'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing...
                  </span>
                ) : (
                  isLogin ? '→ Sign In' : '✨ Create Account'
                )}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isLogin ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginSignup;
