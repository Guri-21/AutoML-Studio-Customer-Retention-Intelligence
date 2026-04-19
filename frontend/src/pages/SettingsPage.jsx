import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Building2, Mail, Shield, Key, Moon, Sun } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

export default function SettingsPage() {
  const { user } = useAuth();
  const { toggle, isDark } = useTheme();

  const fields = [
    { icon: <User size={16} />, label: 'Name', value: user?.name || '—' },
    { icon: <Mail size={16} />, label: 'Email', value: user?.email || '—' },
    { icon: <Building2 size={16} />, label: 'Company', value: user?.company || 'Not set' },
    { icon: <Shield size={16} />, label: 'Role', value: user?.role || 'user', badge: true },
    { icon: <Key size={16} />, label: 'Organization', value: user?.orgId || 'org_default' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-sm text-(--color-text-secondary) mb-8">Manage your account preferences.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-4">Profile</h3>
          <div className="space-y-0">
            {fields.map((f, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-(--color-border) last:border-0">
                <div className="flex items-center gap-2.5 text-sm text-(--color-text-secondary)">{f.icon} {f.label}</div>
                {f.badge ? (
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${f.value === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-(--color-accent)/10 text-(--color-accent)'}`}>{f.value}</span>
                ) : (
                  <span className="text-sm font-medium">{f.value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <h3 className="font-semibold text-sm mb-4">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Theme</div>
                <div className="text-xs text-(--color-text-muted)">{isDark ? 'Dark mode is active' : 'Light mode is active'}</div>
              </div>
              <button onClick={toggle} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-(--color-border) hover:bg-(--color-bg-hover) transition-colors cursor-pointer">
                {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <h3 className="font-semibold text-sm mb-4">Plan & Billing</h3>
            <div className="text-center py-4">
              <span className="inline-flex px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-semibold">Free Plan</span>
              <p className="text-xs text-(--color-text-muted) mt-2">Unlimited analyses • All ML models</p>
              <button className="mt-4 px-4 py-2 rounded-full text-sm font-medium bg-(--color-accent) text-white opacity-50 cursor-not-allowed">Upgrade (Coming Soon)</button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="font-semibold text-sm text-red-500 mb-2">Danger Zone</h3>
            <p className="text-xs text-(--color-text-muted) mb-3">Permanently delete your account and all data.</p>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer">Delete Account</button>
          </motion.div>
        </div>
      </div>

      <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
        <h3 className="font-semibold text-sm mb-2">Keyboard Shortcuts</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            ['⌘ K', 'Command palette'],
            ['⌘ /','Toggle theme'],
          ].map(([key, desc], i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-(--color-text-secondary)">{desc}</span>
              <kbd className="px-2 py-0.5 rounded-md text-xs bg-(--color-bg) border border-(--color-border) text-(--color-text-muted) font-mono">{key}</kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
