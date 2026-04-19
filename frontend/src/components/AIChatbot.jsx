import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { spring, buttonPress } from '../lib/motion';
import axios from 'axios';

const STARTER_SUGGESTIONS = [
  "Summarize my analysis results",
  "What are the key anomaly patterns?",
  "How can I reduce churn?",
  "Which columns have data quality issues?",
];

export default function AIChatbot({ analysisId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(
        `http://${window.location.hostname}:5001/api/chat`,
        { message: text.trim(), analysisId, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get response. Check that GEMINI_API_KEY is set.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ ...spring.bouncy }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-(--color-accent) text-white shadow-lg shadow-(--color-accent)/30 flex items-center justify-center cursor-pointer hover:shadow-xl hover:shadow-(--color-accent)/40 transition-shadow"
          >
            <Sparkles size={22} />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-(--color-accent)"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ...spring.snappy }}
            className="fixed bottom-6 right-6 z-[95] w-[400px] h-[560px] rounded-2xl border border-(--color-border) bg-(--color-bg) shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border) bg-(--color-bg-card)">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-(--color-accent)/10 flex items-center justify-center">
                  <Bot size={16} className="text-(--color-accent)" />
                </div>
                <div>
                  <div className="text-sm font-semibold">AI Data Assistant</div>
                  <div className="text-[11px] text-(--color-text-muted)">Powered by Gemini</div>
                </div>
              </div>
              <motion.button
                {...buttonPress}
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-(--color-text-muted) hover:bg-(--color-bg-hover) hover:text-(--color-text) transition-colors cursor-pointer"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center pt-6"
                >
                  <div className="w-12 h-12 rounded-full bg-(--color-accent)/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={20} className="text-(--color-accent)" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Ask anything about your data</h3>
                  <p className="text-xs text-(--color-text-muted) mb-4">
                    I can analyze your results, explain patterns, and suggest next steps.
                  </p>
                  <div className="space-y-2">
                    {STARTER_SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        onClick={() => sendMessage(s)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-xs bg-(--color-bg-card) border border-(--color-border) hover:border-(--color-accent)/40 hover:bg-(--color-accent)/5 transition-colors cursor-pointer text-(--color-text-secondary)"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.gentle }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-(--color-accent)/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={12} className="text-(--color-accent)" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-(--color-accent) text-white rounded-br-sm'
                        : 'bg-(--color-bg-card) border border-(--color-border) text-(--color-text) rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0 [&_strong]:text-(--color-text) [&_code]:text-(--color-accent) [&_code]:bg-(--color-bg-hover) [&_code]:px-1 [&_code]:rounded text-(--color-text-secondary)">
                        {msg.content.split('\n').map((line, li) => {
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            return <div key={li} className="flex gap-1.5 my-0.5"><span className="text-(--color-accent)">•</span><span>{line.slice(2)}</span></div>;
                          }
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <div key={li} className="font-semibold text-(--color-text) mt-1">{line.replace(/\*\*/g, '')}</div>;
                          }
                          return line ? <p key={li}>{line}</p> : <br key={li} />;
                        })}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-(--color-text)/10 flex items-center justify-center shrink-0 mt-1">
                      <User size={12} className="text-(--color-text-secondary)" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-6 h-6 rounded-full bg-(--color-accent)/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={12} className="text-(--color-accent)" />
                  </div>
                  <div className="px-3 py-2 rounded-xl rounded-bl-sm bg-(--color-bg-card) border border-(--color-border)">
                    <div className="flex gap-1 items-center">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-(--color-border) bg-(--color-bg-card)">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your data..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg bg-(--color-bg) border border-(--color-border) text-sm outline-none focus:border-(--color-accent) transition-colors disabled:opacity-50"
              />
              <motion.button
                {...buttonPress}
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg bg-(--color-accent) text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-opacity"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
