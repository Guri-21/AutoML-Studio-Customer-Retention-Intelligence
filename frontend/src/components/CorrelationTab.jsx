import React from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeUp, spring } from '../lib/motion';

export default function CorrelationTab({ data }) {
  if (!data) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No correlation data available.</p>;

  // API returns: { columns: [...], matrix: [[...]], top_correlations: [...] }
  const { columns = [], matrix = [], top_correlations = [] } = data;

  // Color scale: strong positive → blue, strong negative → red
  function cellColor(value) {
    if (value == null || isNaN(value)) return 'transparent';
    const abs = Math.abs(value);
    if (value > 0) return `rgba(10, 132, 255, ${abs * 0.8})`;
    return `rgba(239, 68, 68, ${abs * 0.8})`;
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      {top_correlations.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-3">Strongest Correlations</h3>
          <div className="space-y-2">
            {top_correlations.slice(0, 10).map((c, i) => {
              const val = c.correlation ?? c.value ?? 0;
              const label = c.pair || `${c.col1 || c.column1 || '?'} ↔ ${c.col2 || c.column2 || '?'}`;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs w-40 shrink-0 text-(--color-text-secondary) truncate">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-(--color-bg-hover) overflow-hidden flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(val) * 100}%` }}
                      transition={{ ...spring.bouncy, delay: i * 0.05 + 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: val > 0 ? 'var(--color-accent)' : '#ef4444' }}
                    />
                  </div>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 + 0.4 }} className={`text-xs w-12 text-right font-medium ${val > 0 ? 'text-(--color-accent)' : 'text-red-500'}`}>{typeof val === 'number' ? val.toFixed(2) : val}</motion.span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {matrix.length > 0 && columns.length > 0 && columns.length <= 15 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 overflow-x-auto">
          <h3 className="font-semibold text-sm mb-3">Correlation Matrix</h3>
          <table className="text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1"></th>
                {columns.map((c, i) => <th key={i} className="px-2 py-1 text-(--color-text-muted) text-right" style={{ writingMode: 'vertical-lr', height: 80 }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, ri) => (
                <tr key={ri}>
                  <td className="px-2 py-1 text-(--color-text-secondary) text-right">{columns[ri]}</td>
                  {row.map((val, ci) => (
                    <td key={ci} className="px-1 py-0.5 text-center" style={{ background: cellColor(val), borderRadius: 4, minWidth: 32 }}>
                      <span className="text-white/90 text-[10px]">{typeof val === 'number' ? val.toFixed(1) : ''}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {matrix.length > 0 && columns.length > 15 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 text-center">
          <p className="text-sm text-(--color-text-muted)">Correlation matrix too large to display ({columns.length} × {columns.length}). See top correlations above.</p>
        </div>
      )}
    </motion.div>
  );
}
