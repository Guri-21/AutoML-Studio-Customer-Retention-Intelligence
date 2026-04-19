import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Download, Loader2, Info, Trash2 } from 'lucide-react';
import { stagger, fadeUp, spring, buttonPress } from '../lib/motion';
import axios from 'axios';

function QualityGauge({ score }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#30d158' : score >= 60 ? '#ffd60a' : '#ff453a';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, ...spring.bouncy }}
          className="text-2xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

export default function DataHealthTab({ data, file }) {
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  if (!data) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No data health info available.</p>;

  const { overall_score, completeness, uniqueness, consistency, duplicate_rows, duplicate_pct, column_health = [], issues = [] } = data;

  const handleAutoFix = async () => {
    if (!file) return;
    setFixing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/fix-csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob', timeout: 300000 }
      );

      // Extract metadata from headers
      const fixesApplied = res.headers['x-fixes-applied'] || '0';
      const cellsFixed = res.headers['x-cells-fixed'] || '0';
      const dupesRemoved = res.headers['x-duplicates-removed'] || '0';
      const rowsRemaining = res.headers['x-rows-remaining'] || '?';

      setFixResult({ fixesApplied, cellsFixed, dupesRemoved, rowsRemaining });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.csv', '_fixed.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Auto-fix failed:', err);
    } finally {
      setFixing(false);
    }
  };

  const scoreMetrics = [
    { label: 'Completeness', value: completeness, desc: 'Non-missing values' },
    { label: 'Uniqueness', value: uniqueness, desc: 'Non-duplicate rows' },
    { label: 'Consistency', value: consistency, desc: 'Type coherence' },
  ];

  // Columns sorted by missing % descending for heatmap
  const sortedCols = [...column_health].sort((a, b) => b.missing_pct - a.missing_pct);
  const colsWithMissing = sortedCols.filter(c => c.missing > 0);

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      {/* Score + Sub-metrics */}
      <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Shield size={16} className="text-(--color-accent)" /> Data Quality Score</h3>
        <div className="grid sm:grid-cols-4 gap-6 items-center">
          <QualityGauge score={overall_score} />
          {scoreMetrics.map((m, i) => {
            const color = m.value >= 80 ? 'text-green-500' : m.value >= 60 ? 'text-amber-500' : 'text-red-500';
            return (
              <motion.div key={i} variants={fadeUp} className="text-center sm:text-left">
                <div className="text-xs text-(--color-text-muted) mb-0.5">{m.label}</div>
                <div className={`text-xl font-bold ${color}`}>{m.value}%</div>
                <div className="text-[11px] text-(--color-text-muted)">{m.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Issues */}
      {issues.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Issues Found ({issues.length})</h3>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  issue.severity === 'warning' ? 'bg-amber-500/5 border border-amber-500/15' : 'bg-(--color-bg-hover) border border-(--color-border)'
                }`}
              >
                {issue.severity === 'warning' ? (
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Info size={14} className="text-(--color-text-muted) shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-(--color-text-secondary)">{issue.message}</div>
                  {issue.columns && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {issue.columns.slice(0, 8).map((c, j) => (
                        <span key={j} className="px-1.5 py-0.5 rounded text-[11px] bg-(--color-bg-hover) text-(--color-text-muted)">{c}</span>
                      ))}
                      {issue.columns.length > 8 && <span className="text-[11px] text-(--color-text-muted)">+{issue.columns.length - 8} more</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Missing Values Heatmap */}
      {colsWithMissing.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-3">Missing Values by Column</h3>
          <div className="space-y-1.5">
            {colsWithMissing.slice(0, 15).map((col, i) => {
              const intensity = Math.min(col.missing_pct / 50, 1);
              const barColor = col.missing_pct > 30 ? '#ff453a' : col.missing_pct > 10 ? '#ffd60a' : '#30d158';
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs w-36 shrink-0 text-(--color-text-secondary) truncate">{col.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-(--color-bg-hover) overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(col.missing_pct, 0.5)}%` }}
                      transition={{ ...spring.bouncy, delay: i * 0.04 + 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                  <span className="text-xs w-14 text-right text-(--color-text-muted)">{col.missing_pct}%</span>
                  <span className="text-[11px] w-16 text-right text-(--color-text-muted)">{col.missing.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Duplicates */}
      {duplicate_rows > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 size={16} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-amber-500">{duplicate_rows.toLocaleString()} Duplicate Rows Detected</h3>
          </div>
          <p className="text-xs text-(--color-text-secondary)">{duplicate_pct}% of your dataset consists of exact duplicate rows. Use Auto-Fix to remove them.</p>
        </motion.div>
      )}

      {/* Column Health Table */}
      <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
        <div className="p-4 border-b border-(--color-border) font-semibold text-sm">Column Health Overview</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-(--color-border)">
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Missing</th>
                <th className="px-4 py-3">Unique</th>
                <th className="px-4 py-3">Outliers</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {column_health.slice(0, 20).map((col, i) => {
                const healthy = col.missing_pct < 5 && (col.outlier_pct || 0) < 10 && !col.is_constant;
                return (
                  <tr key={i} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-hover) transition-colors">
                    <td className="px-4 py-2.5 font-medium">{col.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${col.category === 'numeric' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                        {col.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-(--color-text-secondary)">{col.missing_pct}%</td>
                    <td className="px-4 py-2.5 text-(--color-text-secondary)">{col.unique.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-(--color-text-secondary)">{col.outlier_pct != null ? `${col.outlier_pct}%` : '—'}</td>
                    <td className="px-4 py-2.5">
                      {healthy ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle size={12} /> Good</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-xs"><AlertTriangle size={12} /> Review</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Auto-Fix Action */}
      <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
        <h3 className="font-semibold text-sm mb-2">🔧 One-Click Auto-Fix</h3>
        <p className="text-xs text-(--color-text-secondary) mb-4">
          Automatically fill missing values (median for numbers, mode for categories), remove duplicate rows, and download the cleaned dataset.
        </p>

        <AnimatePresence>
          {fixResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-green-500/5 border border-green-500/15"
            >
              <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-1">
                <CheckCircle size={14} /> Fix Applied Successfully
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-(--color-text-secondary)">
                <div><span className="font-medium text-(--color-text)">{fixResult.fixesApplied}</span> fixes applied</div>
                <div><span className="font-medium text-(--color-text)">{fixResult.cellsFixed}</span> cells filled</div>
                <div><span className="font-medium text-(--color-text)">{fixResult.dupesRemoved}</span> dupes removed</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          {...buttonPress}
          onClick={handleAutoFix}
          disabled={fixing || !file}
          className="flex items-center gap-2 px-5 py-2.5 bg-(--color-accent) text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 transition-opacity"
        >
          {fixing ? (
            <><Loader2 size={16} className="animate-spin" /> Fixing...</>
          ) : (
            <><Download size={16} /> Auto-Fix & Download</>
          )}
        </motion.button>
        {!file && <p className="text-[11px] text-(--color-text-muted) mt-2">Upload a dataset in Workspace first to enable auto-fix.</p>}
      </motion.div>
    </motion.div>
  );
}
