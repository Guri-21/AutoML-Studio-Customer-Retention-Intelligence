import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, LayoutDashboard, Upload, BarChart3, Settings, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { id: 'workspace', label: 'Go to Workspace', icon: <Upload size={16} />, path: '/app' },
  { id: 'usage', label: 'Usage Analytics', icon: <BarChart3 size={16} />, path: '/app/usage' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, path: '/app/settings' },
  { id: 'admin', label: 'Admin Panel', icon: <Shield size={16} />, path: '/app/admin' },
  { id: 'reports', label: 'Reports', icon: <FileText size={16} />, path: '/app/reports' },
  { id: 'history', label: 'Analysis History', icon: <LayoutDashboard size={16} />, path: '/app/history' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery('');
    }
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const run = (cmd) => {
    navigate(cmd.path);
    setOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[201] rounded-2xl bg-(--color-bg-elevated) border border-(--color-border) shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-(--color-border)">
              <Search size={18} className="text-(--color-text-muted)" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm outline-none text-(--color-text) placeholder:text-(--color-text-muted)"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-(--color-bg-card) text-(--color-text-muted) border border-(--color-border)">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {filtered.length > 0 ? filtered.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => run(cmd)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-hover) hover:text-(--color-text) transition-colors cursor-pointer"
                >
                  <span className="text-(--color-text-muted)">{cmd.icon}</span>
                  <span className="flex-1 text-left">{cmd.label}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                </button>
              )) : (
                <div className="px-4 py-8 text-center text-sm text-(--color-text-muted)">No results found.</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
