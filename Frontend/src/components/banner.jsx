import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import image from "../assets/images/image.png"

const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 dark:opacity-20 pointer-events-none ${className}`}
    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const StatBadge = ({ icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-3 shadow-lg shadow-black/5"
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  </motion.div>
);

const FeatureChip = ({ icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
  >
    <span>{icon}</span> {text}
  </motion.div>
);

const Banner = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      
      {/* Background Orbs */}
      <FloatingOrb className="w-[600px] h-[600px] bg-indigo-400 -top-32 -left-32" delay={0} />
      <FloatingOrb className="w-[500px] h-[500px] bg-violet-400 top-1/4 -right-32" delay={2} />
      <FloatingOrb className="w-[400px] h-[400px] bg-cyan-400 bottom-0 left-1/3" delay={4} />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left Content */}
          <motion.div
            style={{ y, opacity }}
            className="flex-1 text-center lg:text-left space-y-8 max-w-2xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-sm shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              AI-Powered Learning Platform
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold">NEW</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                Learn Smarter
                <br />
                <span className="gradient-text">Not Harder</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-2">
                Transform any YouTube video into structured notes, AI-powered Q&A, and personalized study sessions — all in one workspace.
              </p>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              <FeatureChip icon="📝" text="AI Notes" delay={0.35} />
              <FeatureChip icon="💬" text="Video Chatbot" delay={0.4} />
              <FeatureChip icon="🎯" text="Timestamps" delay={0.45} />
              <FeatureChip icon="📄" text="PDF Export" delay={0.5} />
              <FeatureChip icon="🧠" text="AI Mentor" delay={0.55} />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/learning">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ⚡ Start Learning Free
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >→</motion.span>
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                </motion.button>
              </Link>
              <Link to="/mentor">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-lg font-bold rounded-2xl shadow-lg transition-all"
                >
                  🧠 Try AI Mentor
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <StatBadge icon="🎓" value="10K+" label="Students" delay={0.6} />
              <StatBadge icon="📹" value="50K+" label="Videos Analyzed" delay={0.65} />
              <StatBadge icon="⭐" value="4.9/5" label="Rating" delay={0.7} />
            </motion.div>
          </motion.div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full flex justify-center relative"
          >
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-cyan-500/20 rounded-full blur-3xl scale-90" />
            
            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full border border-indigo-200/30 dark:border-indigo-500/10 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute w-64 h-64 rounded-full border border-violet-200/30 dark:border-violet-500/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>

            <motion.img
              animate={{ y: [0, -18, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              src={image}
              className="relative z-10 h-80 md:h-[420px] lg:h-[500px] object-contain drop-shadow-2xl"
              alt="LearnedUp Dashboard Preview"
            />

            {/* Floating UI cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute top-8 -left-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/10 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 text-lg">✓</div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Notes Generated</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Full video coverage</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute bottom-16 -right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/10 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg">🤖</div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">AI Answering...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on video context</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
};

export default Banner;
