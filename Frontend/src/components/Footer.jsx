import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const links = {
    Product: [
      { label: 'Learning Dashboard', to: '/learning' },
      { label: 'AI Mentor', to: '/mentor' },
      { label: 'Profile & History', to: '/profile' },
    ],
    Company: [
      { label: 'About Us', to: '/' },
      { label: 'Contact', to: '/#contact' },
      { label: 'Sign In', to: '/login' },
    ],
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-black text-lg">L</span>
              </div>
              <span className="text-xl font-black text-white">LearnedUp</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Transform any YouTube video into structured notes, AI-powered Q&A, and personalized study sessions.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm hover:text-indigo-400 transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} LearnedUp. AI-Powered Video Learning Platform.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Built with ❤️ for learners</span>
            <span>•</span>
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
