import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  const [form, setForm] = useState({ query: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.query.trim() || !form.email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section className="relative bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-indigo-100/50 dark:via-indigo-500/5 dark:to-indigo-500/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-semibold border border-indigo-200 dark:border-indigo-500/20">
              📬 Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Let's Build
              <br />
              <span className="gradient-text">Something Together</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Have ideas, feedback, or want to collaborate? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>

            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Quick Response', desc: 'We reply within 24 hours' },
                { icon: '🤝', title: 'Open to Collaboration', desc: 'Partnerships & integrations welcome' },
                { icon: '💡', title: 'Feature Requests', desc: 'Your ideas shape our roadmap' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-black/5 p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-3xl mx-auto">
                    ✅
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Message Sent!</h3>
                  <p className="text-slate-600 dark:text-slate-400">Thanks for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ query: '', email: '' }); }}
                    className="btn-ghost text-sm px-6 py-2.5"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Send a Message</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fill out the form and we'll be in touch.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Your Message
                      </label>
                      <textarea
                        value={form.query}
                        onChange={e => setForm({ ...form, query: e.target.value })}
                        placeholder="Tell us about your idea, feedback, or question..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 input-ring resize-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 input-ring text-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>📨 Send Message</>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
