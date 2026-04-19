import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock } from 'lucide-react';

const API = `http://${window.location.hostname}:5001/api/usage`;
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function UsagePage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [token]);

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-8 w-48 rounded-lg bg-(--color-bg-card)" /><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-(--color-bg-card)" />)}</div></div>;

  const metrics = [
    { label: 'Total Analyses', value: stats?.totalAnalyses || 0, sub: 'All-time' },
    { label: 'Rows Processed', value: (stats?.totalRows || 0).toLocaleString(), sub: 'Cumulative' },
    { label: 'This Week', value: stats?.dailyChart?.reduce((s, d) => s + d.count, 0) || 0, sub: 'Last 7 days' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold mb-1">Usage Analytics</h2>
        <p className="text-sm text-(--color-text-secondary) mb-8">Track your analysis activity and resource consumption.</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={i} variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <div className="text-xs text-(--color-text-muted) mb-1">{m.label}</div>
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs text-(--color-text-muted) mt-0.5">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm"><Activity size={16} className="text-(--color-accent)" /> Weekly Activity</h3>
          {stats?.dailyChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-(--color-text-muted) text-center py-8">Run analyses to see activity here.</p>}
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm"><Clock size={16} className="text-amber-500" /> Recent Analyses</h3>
          {stats?.recentLogs?.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">{stats.recentLogs.map((l, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-(--color-border) last:border-0">
                <div><div className="text-sm font-medium">{l.filename}</div><div className="text-[11px] text-(--color-text-muted)">{new Date(l.timestamp).toLocaleString()}</div></div>
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-(--color-accent)/10 text-(--color-accent)">{l.rowsProcessed?.toLocaleString()} rows</span>
              </div>
            ))}</div>
          ) : <p className="text-sm text-(--color-text-muted) text-center py-8">No analyses run yet.</p>}
        </motion.div>
      </div>
    </motion.div>
  );
}
