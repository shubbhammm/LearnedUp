import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import workflowImg from "../assets/images/workflow.png";

const steps = [
  {
    step: "01",
    icon: "🔗",
    title: "Paste Your Video Link",
    desc: "Drop any YouTube URL into the learning dashboard. We support all YouTube formats.",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI Analyzes the Full Video",
    desc: "Our AI reads the complete transcript and generates structured, comprehensive notes covering every topic.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/20",
  },
  {
    step: "03",
    icon: "💬",
    title: "Chat with Your Video",
    desc: "Ask any question about the video. The AI answers with full context from the entire transcript.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
  },
  {
    step: "04",
    icon: "📄",
    title: "Export & Review",
    desc: "Download beautiful PDF notes, review timestamps, and track your learning history.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    border: "border-pink-200 dark:border-pink-500/20",
  },
];

const features = [
  { icon: "⚡", title: "Instant Transcripts", desc: "Auto-fetched from any YouTube video in seconds" },
  { icon: "🧠", title: "Smart AI Notes", desc: "Full-video coverage, not just a snippet" },
  { icon: "🎯", title: "Clickable Timestamps", desc: "Jump to any moment in the video instantly" },
  { icon: "🗣️", title: "Voice Mentor", desc: "Talk to your AI tutor using your voice" },
  { icon: "📊", title: "Learning History", desc: "All your sessions saved and resumable" },
  { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes, day or night" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const WalkThroughit = () => {
  return (
    <section className="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">

      {/* ── How It Works ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-500/20">
            🚀 How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            From Video to <span className="gradient-text">Mastery</span>
          </h2>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Four simple steps to transform how you learn from videos
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`relative p-6 rounded-3xl border ${s.bg} ${s.border} group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600 z-10" />
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <div className="text-xs font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">STEP {s.step}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Workflow Image ── */}
      <div className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              The Complete <span className="gradient-text">Workflow</span>
            </h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl shadow-black/10"
          >
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-100 dark:bg-slate-800 flex items-center gap-2 px-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium">LearnedUp Workflow</span>
            </div>
            <img
              src={workflowImg}
              alt="LearnedUp Workflow"
              className="w-full h-auto object-contain pt-8 bg-white dark:bg-slate-900"
            />
          </motion.div>
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-4 border border-violet-200 dark:border-violet-500/20">
            ✨ Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Packed with <span className="gradient-text">Powerful Features</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link to="/learning">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Learning Now
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WalkThroughit;
