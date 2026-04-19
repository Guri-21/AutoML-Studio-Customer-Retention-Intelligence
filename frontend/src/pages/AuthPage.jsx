import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Activity, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { spring, buttonPress, stagger, fadeUp, pageTransition } from '../lib/motion';
import { API_URL } from '../lib/api';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isLogin = mode === 'login';

  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const API = `${API_URL}/api/auth`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      login(data.token, data.user);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-(--color-bg) flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glowing orb for depth */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse,var(--color-accent)_0%,transparent_60%)] pointer-events-none"
        animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ zIndex: 0 }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode} // Re-animate if mode switches between login/signup
          {...pageTransition}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold mb-6">
              <motion.div {...buttonPress}>
                <Activity size={22} className="text-(--color-accent)" />
              </motion.div>
              AutoML Studio
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.gentle, delay: 0.1 }}
              className="text-2xl font-bold"
            >
              {isLogin ? 'Welcome back' : 'Create your account'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-(--color-text-secondary) mt-1"
            >
              {isLogin ? 'Sign in to continue' : 'Start analyzing your data for free'}
            </motion.p>
          </div>

          <motion.form
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* AnimatePresence for conditional fields so they don't snap */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ ...spring.snappy }}
                >
                  <label className="block text-sm font-medium mb-1.5 transition-colors" style={{ color: focusedInput === 'name' ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>Name</label>
                  <motion.div className="relative rounded-xl bg-(--color-bg-card)" animate={focusedInput === 'name' ? { scale: 1.01 } : { scale: 1 }} transition={{ ...spring.snappy }}>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required
                      onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-(--color-border) text-sm outline-none transition-colors relative z-10 focus:border-(--color-accent)" placeholder="Your name" />
                    {focusedInput === 'name' && (
                      <motion.div layoutId="input-focus" className="absolute inset-0 rounded-xl ring-2 ring-(--color-accent)/20" transition={{ ...spring.micro }} />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-1.5 transition-colors" style={{ color: focusedInput === 'email' ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>Email</label>
              <motion.div className="relative rounded-xl bg-(--color-bg-card)" animate={focusedInput === 'email' ? { scale: 1.01 } : { scale: 1 }} transition={{ ...spring.snappy }}>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                  onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-(--color-border) text-sm outline-none transition-colors relative z-10 focus:border-(--color-accent)" placeholder="you@company.com" />
                {focusedInput === 'email' && (
                  <motion.div layoutId="input-focus" className="absolute inset-0 rounded-xl ring-2 ring-(--color-accent)/20" transition={{ ...spring.micro }} />
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-1.5 transition-colors" style={{ color: focusedInput === 'password' ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>Password</label>
              <motion.div className="relative rounded-xl bg-(--color-bg-card)" animate={focusedInput === 'password' ? { scale: 1.01 } : { scale: 1 }} transition={{ ...spring.snappy }}>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required minLength={6}
                  onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-(--color-border) text-sm outline-none transition-colors relative z-10 pr-10 focus:border-(--color-accent)" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) cursor-pointer z-20 hover:text-(--color-text) transition-colors">
                  <motion.div whileTap={{ scale: 0.8 }} transition={{ ...spring.micro }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.div>
                </button>
                {focusedInput === 'password' && (
                  <motion.div layoutId="input-focus" className="absolute inset-0 rounded-xl ring-2 ring-(--color-accent)/20" transition={{ ...spring.micro }} />
                )}
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ ...spring.snappy }}
                  style={{ marginTop: '1rem' }}
                >
                  <label className="block text-sm font-medium mb-1.5 transition-colors" style={{ color: focusedInput === 'company' ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>Company <span className="opacity-60 font-normal">(optional)</span></label>
                  <motion.div className="relative rounded-xl bg-(--color-bg-card)" animate={focusedInput === 'company' ? { scale: 1.01 } : { scale: 1 }} transition={{ ...spring.snappy }}>
                    <input type="text" value={form.company} onChange={e => update('company', e.target.value)}
                      onFocus={() => setFocusedInput('company')} onBlur={() => setFocusedInput(null)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-(--color-border) text-sm outline-none transition-colors relative z-10 focus:border-(--color-accent)" placeholder="Acme Inc." />
                    {focusedInput === 'company' && (
                      <motion.div layoutId="input-focus" className="absolute inset-0 rounded-xl ring-2 ring-(--color-accent)/20" transition={{ ...spring.micro }} />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ ...spring.snappy }}
                  className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4"
                >
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp} className="pt-2">
              <motion.button
                type="submit" disabled={loading}
                {...buttonPress}
                className="w-full bg-(--color-accent) text-white font-medium py-3 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm shadow-(--color-accent)/20 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ ...spring.snappy }} className="flex gap-1.5 items-center">
                      <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    </motion.div>
                  ) : (
                    <motion.span key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ ...spring.snappy }}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Subtle highlight effect across button */}
                <motion.div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" initial={{ x: '-150%' }} whileHover={{ x: '150%' }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-(--color-text-muted) mt-6"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} className="text-(--color-accent) font-medium hover:underline relative transition-colors">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
