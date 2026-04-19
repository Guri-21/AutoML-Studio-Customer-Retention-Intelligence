import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, BarChart3, Shield, Clock } from 'lucide-react';

const API = `http://${window.location.hostname}:5001/api`;
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function AdminPanel() {
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const [u, o, s] = await Promise.all([
          axios.get(`${API}/auth/admin/users`, { headers }),
          axios.get(`${API}/auth/admin/orgs`, { headers }),
          axios.get(`${API}/usage/admin/stats`, { headers }).catch(() => ({ data: {} }))
        ]);
        setUsers(u.data.users || []);
        setOrgs(o.data.orgs || []);
        setStats(s.data || {});
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'users', label: 'Users', icon: <Users size={14} /> },
    { id: 'orgs', label: 'Organizations', icon: <Building2 size={14} /> },
  ];

  if (loading) return <AdminSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-1">
        <Shield size={20} className="text-(--color-accent)" />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <p className="text-sm text-(--color-text-secondary) mb-6">Manage users, organizations, and platform analytics.</p>

      <div className="flex gap-1 p-1 rounded-xl bg-(--color-bg-card) border border-(--color-border) mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === t.id ? 'bg-(--color-bg) text-(--color-text) shadow-sm' : 'text-(--color-text-secondary) hover:text-(--color-text)'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminOverview stats={stats} users={users} orgs={orgs} />}
      {tab === 'users' && <AdminUsers users={users} />}
      {tab === 'orgs' && <AdminOrgs orgs={orgs} />}
    </motion.div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-(--color-bg-card)" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-(--color-bg-card)" />)}</div>
    </div>
  );
}

function AdminOverview({ stats, users, orgs }) {
  const metrics = [
    { label: 'Total Users', value: users.length, color: 'text-(--color-accent)' },
    { label: 'Organizations', value: orgs.length, color: 'text-green-500' },
    { label: 'Analyses Run', value: stats?.totalAnalyses || 0, color: 'text-amber-500' },
    { label: 'Rows Processed', value: (stats?.totalRows || 0).toLocaleString(), color: 'text-purple-500' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <div className="text-xs text-(--color-text-muted) mb-1">{m.label}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
          </motion.div>
        ))}
      </div>
      <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock size={16} className="text-(--color-text-muted)" /> Recent Activity</h3>
        {stats?.recentLogs?.length > 0 ? (
          <div className="space-y-2">{stats.recentLogs.slice(0, 5).map((l, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-(--color-border) last:border-0 text-sm">
              <span>{l.filename}</span>
              <span className="text-(--color-text-muted)">{l.rowsProcessed?.toLocaleString()} rows</span>
            </div>
          ))}</div>
        ) : <p className="text-sm text-(--color-text-muted)">No activity yet.</p>}
      </motion.div>
    </motion.div>
  );
}

function AdminUsers({ users }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
      <div className="p-4 border-b border-(--color-border) font-semibold text-sm">All Users ({users.length})</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-(--color-border)">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Org</th><th className="px-4 py-3">Joined</th>
          </tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-hover) transition-colors">
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-(--color-text-secondary)">{u.email}</td>
              <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-(--color-accent)/10 text-(--color-accent)'}`}>{u.role}</span></td>
              <td className="px-4 py-3 text-(--color-text-muted)">{u.orgId}</td>
              <td className="px-4 py-3 text-(--color-text-muted)">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </motion.div>
  );
}

function AdminOrgs({ orgs }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
      <div className="p-4 border-b border-(--color-border) font-semibold text-sm">Organizations ({orgs.length})</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-(--color-border)">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Members</th><th className="px-4 py-3">Created</th>
          </tr></thead>
          <tbody>{orgs.map(o => (
            <tr key={o.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-hover) transition-colors">
              <td className="px-4 py-3 font-medium">{o.name}</td>
              <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-500">{o.plan}</span></td>
              <td className="px-4 py-3">{o.memberCount || 0}</td>
              <td className="px-4 py-3 text-(--color-text-muted)">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </motion.div>
  );
}
