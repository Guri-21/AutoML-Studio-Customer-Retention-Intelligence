import React from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/motion';

export default function ProfileTab({ data }) {
  if (!data) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No profile data available.</p>;

  // API returns: total_rows, total_columns, total_missing, quality_score, memory_mb, numeric_columns, categorical_columns, columns[]
  const columns = data.columns || [];

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Columns Analyzed</div>
          <div className="text-2xl font-bold">{data.total_columns || columns.length}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Quality Score</div>
          <div className="text-2xl font-bold text-green-500">{data.quality_score != null ? `${data.quality_score.toFixed ? data.quality_score.toFixed(1) : data.quality_score}%` : '—'}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Missing Values</div>
          <div className="text-2xl font-bold text-amber-500">{data.total_missing || 0}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Memory</div>
          <div className="text-2xl font-bold">{data.memory_mb ? `${data.memory_mb} MB` : '—'}</div>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Numeric Columns</div>
          <div className="text-lg font-bold">{data.numeric_columns || 0}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Categorical Columns</div>
          <div className="text-lg font-bold">{data.categorical_columns || 0}</div>
        </motion.div>
      </div>

      {columns.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
          <div className="p-4 border-b border-(--color-border) font-semibold text-sm">Column Statistics ({columns.length} columns)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-(--color-border)">
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unique</th>
                <th className="px-4 py-3">Missing</th>
                <th className="px-4 py-3">Missing %</th>
              </tr></thead>
              <tbody>{columns.slice(0, 30).map((c, i) => (
                <tr key={i} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-hover) transition-colors">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-md text-xs bg-(--color-bg-hover) text-(--color-text-muted)">{c.dtype}</span></td>
                  <td className="px-4 py-2.5 text-(--color-text-secondary) capitalize">{c.category || '—'}</td>
                  <td className="px-4 py-2.5 text-(--color-text-secondary)">{c.unique?.toLocaleString() || '—'}</td>
                  <td className="px-4 py-2.5 text-(--color-text-secondary)">{c.missing?.toLocaleString() || 0}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${(c.missing_pct || 0) > 10 ? 'text-red-500' : (c.missing_pct || 0) > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                      {c.missing_pct != null ? `${c.missing_pct.toFixed(1)}%` : '0%'}
                    </span>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
