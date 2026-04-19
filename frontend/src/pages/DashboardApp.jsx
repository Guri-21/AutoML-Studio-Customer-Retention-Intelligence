import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Database, FileText, Settings, Activity, LogOut, Clock, Shield, BarChart3, Moon, Sun, Upload, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spring, buttonPress, pageTransition } from '../lib/motion';
import CommandPalette from '../components/CommandPalette';
import Workspace from '../components/Workspace';
import UsagePage from './UsagePage';
import SettingsPage from './SettingsPage';
import AdminPanel from './AdminPanel';
import DatasetsPage from './DatasetsPage';
import ReportsPage from './ReportsPage';
import ReportViewer from './ReportViewer';
import HistoryPage from './HistoryPage';
import AIChatbot from '../components/AIChatbot';

export default function DashboardApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { toggle, isDark } = useTheme();

  const handleLogout = () => { logout(); navigate('/'); };

  const sections = [
    { label: 'Main', items: [
      { path: '/app', icon: <Upload size={18} />, label: 'Workspace' },
      { path: '/app/history', icon: <Clock size={18} />, label: 'History' },
      { path: '/app/usage', icon: <BarChart3 size={18} />, label: 'Usage' },
    ]},
    { label: 'Library', items: [
      { path: '/app/datasets', icon: <Database size={18} />, label: 'Datasets' },
      { path: '/app/reports', icon: <FileText size={18} />, label: 'Reports' },
    ]},
    { label: 'Account', items: [
      { path: '/app/settings', icon: <Settings size={18} />, label: 'Settings' },
    ]},
  ];

  if (isAdmin) {
    sections.push({ label: 'Admin', items: [
      { path: '/app/admin', icon: <Shield size={18} />, label: 'Admin Panel' },
    ]});
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="flex h-screen bg-(--color-bg) text-(--color-text)">
      <CommandPalette />

      {/* Sidebar — stays fixed, no animation */}
      <nav className="w-56 shrink-0 border-r border-(--color-border) bg-(--color-bg) flex flex-col">
        <div className="flex items-center gap-2 px-5 h-16 font-semibold text-sm border-b border-(--color-border)">
          <Activity size={18} className="text-(--color-accent)" />
          AutoML Studio
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {sections.map(section => (
            <div key={section.label}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted) px-2 mb-1.5">{section.label}</div>
              {section.items.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors relative"
                  >
                    {/* Morphing active indicator */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-(--color-bg-card)"
                        transition={{ ...spring.snappy }}
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-2.5 ${active ? 'text-(--color-text) font-medium' : 'text-(--color-text-secondary) hover:text-(--color-text)'}`}>
                      {item.icon} {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-(--color-border) p-3 space-y-2">
          <motion.button
            {...buttonPress}
            onClick={toggle}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Light mode' : 'Dark mode'}
          </motion.button>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-(--color-accent) flex items-center justify-center text-white text-xs font-semibold shrink-0">{initials}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-(--color-text-muted) truncate">{user?.email}</div>
            </div>
          </div>
          <motion.button
            {...buttonPress}
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-(--color-text-secondary) hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Sign out
          </motion.button>
        </div>
      </nav>

      {/* Main content — AnimatePresence crossfade */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...pageTransition}
            >
              <Routes>
                <Route path="/" element={<Workspace />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/usage" element={<UsagePage />} />
                <Route path="/datasets" element={<DatasetsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportViewer />} />
                <Route path="/settings" element={<SettingsPage />} />
                {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* AI Chatbot — globally accessible */}
      <AIChatbot analysisId={location.pathname.includes('/reports/') ? location.pathname.split('/reports/')[1] : null} />
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-sm text-(--color-text-secondary) mb-8">{desc}</p>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring.gentle, delay: 0.1 }}
        className="rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-16 text-center"
      >
        <p className="text-sm text-(--color-text-muted)">Nothing here yet.</p>
      </motion.div>
    </div>
  );
}
