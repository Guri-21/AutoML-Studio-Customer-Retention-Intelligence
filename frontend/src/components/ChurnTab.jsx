import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { stagger, fadeUp, spring } from '../lib/motion';

const COLORS = { 'High Risk': '#ef4444', 'Medium Risk': '#f59e0b', 'Low Risk': '#22c55e' };

export default function ChurnTab({ data }) {
  if (!data) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No churn data available.</p>;

  // API returns segment_counts as {"High Risk": N, "Medium Risk": N, "Low Risk": N}
  const segCounts = data.segment_counts || {};
  const highRisk = segCounts['High Risk'] || 0;
  const medRisk = segCounts['Medium Risk'] || 0;
  const lowRisk = segCounts['Low Risk'] || 0;

  const pieData = Object.entries(segCounts).map(([name, value]) => ({ name, value }));

  // API returns feature_importance as {"recency": 0.86, "frequency": 0.02, ...}
  const fiRaw = data.feature_importance || {};
  const featureList = Object.entries(fiRaw).map(([feature, importance]) => ({ feature, importance }))
    .sort((a, b) => b.importance - a.importance);

  // API returns top_at_risk_customers as [{customer_id, recency, frequency, monetary, churn_probability}]
  const atRisk = data.top_at_risk_customers || [];

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Total Customers</div>
          <div className="text-2xl font-bold">{data.total_customers || 0}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">High Risk</div>
          <div className="text-2xl font-bold text-red-500">{highRisk}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Medium Risk</div>
          <div className="text-2xl font-bold text-amber-500">{medRisk}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Low Risk</div>
          <div className="text-2xl font-bold text-green-500">{lowRisk}</div>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-1">Churn Overview</h3>
          <p className="text-xs text-(--color-text-muted) mb-4">Overall churn rate: {data.overall_churn_rate}% · Retention: {data.retention_rate}%</p>
          {pieData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" isAnimationActive={true} animationDuration={1000} animationEasing="ease-out">
                    {pieData.map((d, i) => <Cell key={i} fill={COLORS[d.name] || '#6366f1'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: 'var(--color-text)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-(--color-text-secondary)">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.name] || '#6366f1' }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {featureList.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <h3 className="font-semibold text-sm mb-3">Feature Importance</h3>
            <div className="space-y-2">
              {featureList.slice(0, 8).map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs w-28 shrink-0 text-(--color-text-secondary) truncate capitalize">{f.feature}</span>
                  <div className="flex-1 h-2 rounded-full bg-(--color-bg-hover) overflow-hidden flex items-center">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${f.importance * 100}%` }} transition={{ ...spring.bouncy, delay: i * 0.05 + 0.3 }} className="h-full rounded-full bg-(--color-accent)" />
                  </div>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 + 0.5 }} className="text-xs text-(--color-text-muted) w-10 text-right">{(f.importance * 100).toFixed(0)}%</motion.span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {atRisk.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="font-semibold text-sm text-red-500 mb-3">At-Risk Customers (Top {Math.min(atRisk.length, 10)})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-red-500/10">
                <th className="px-3 py-2">Customer ID</th>
                <th className="px-3 py-2">Recency</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Monetary</th>
                <th className="px-3 py-2">Churn Prob</th>
              </tr></thead>
              <tbody>{atRisk.slice(0, 10).map((c, i) => (
                <tr key={i} className="border-b border-red-500/10 last:border-0">
                  <td className="px-3 py-2 font-medium">{c.customer_id}</td>
                  <td className="px-3 py-2 text-(--color-text-secondary)">{c.recency}</td>
                  <td className="px-3 py-2 text-(--color-text-secondary)">{c.frequency}</td>
                  <td className="px-3 py-2 text-(--color-text-secondary)">${typeof c.monetary === 'number' ? c.monetary.toFixed(2) : c.monetary}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-500">{(c.churn_probability * 100).toFixed(0)}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
