import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Download, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { stagger, fadeUp, spring, buttonPress } from '../lib/motion';
import axios from 'axios';

export default function AnomalyTab({ data, file }) {
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);

  if (!data) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No anomaly data available.</p>;

  const drivers = data.top_anomaly_drivers || [];

  const handleCleanCSV = async () => {
    if (!file) return;
    setCleaning(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/clean-csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob', timeout: 300000 }
      );

      const rowsRemoved = res.headers['x-rows-removed'] || '?';
      const rowsRemaining = res.headers['x-rows-remaining'] || '?';
      setCleanResult({ rowsRemoved, rowsRemaining });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.csv', '_cleaned.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Clean CSV failed:', err);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Anomalies Found</div>
          <div className="text-2xl font-bold text-amber-500">{data.anomaly_count || 0}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Anomaly %</div>
          <div className="text-2xl font-bold">{data.anomaly_percentage != null ? `${data.anomaly_percentage}%` : '—'}</div>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="text-xs text-(--color-text-muted) mb-1">Severity</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {data.severity_distribution && Object.entries(data.severity_distribution).map(([k, v]) => (
              <span key={k} className={`px-2 py-0.5 rounded-md text-xs font-medium ${k === 'High' ? 'bg-red-500/10 text-red-500' : k === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>{k}: {v}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {drivers.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <h3 className="font-semibold text-sm mb-3">Top Anomaly Drivers</h3>
          <div className="space-y-2">
            {drivers.map((d, i) => {
              const col = typeof d === 'string' ? d : (d.column || d.feature || d.name || '');
              const imp = typeof d === 'object' ? (d.importance || d.score || d.value || d.deviation_pct / 100 || 0.5) : 0.5;
              const pct = typeof d === 'object' && d.deviation_pct != null ? d.deviation_pct : imp * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm w-32 shrink-0 text-(--color-text-secondary) truncate">{col}</span>
                  <div className="flex-1 h-2 rounded-full bg-(--color-bg-hover) overflow-hidden flex items-center">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ ...spring.bouncy, delay: i * 0.05 + 0.2 }} className="h-full rounded-full bg-amber-500" />
                  </div>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 + 0.4 }} className="text-xs text-(--color-text-muted) w-16 text-right">{pct.toFixed(1)}%</motion.span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {data.flagged_samples?.length > 0 && (() => {
        const flat = data.flagged_samples.slice(0, 10).map(s => {
          const { score, values, ...rest } = s;
          const vals = typeof values === 'object' && values ? values : {};
          return { score: typeof score === 'number' ? score.toFixed(3) : score, ...vals, ...rest };
        });
        const cols = flat.length > 0 ? Object.keys(flat[0]).slice(0, 7) : [];
        return (
          <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
            <div className="p-4 border-b border-(--color-border) font-semibold text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Flagged Records ({data.flagged_samples.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-(--color-text-muted) text-xs uppercase tracking-wider border-b border-(--color-border)">
                  {cols.map((k, i) => <th key={i} className="px-4 py-3">{k}</th>)}
                </tr></thead>
                <tbody>{flat.map((row, i) => (
                  <tr key={i} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-hover) transition-colors">
                    {cols.map((k, j) => {
                      const v = row[k];
                      return <td key={j} className="px-4 py-2.5 text-(--color-text-secondary)">{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : typeof v === 'object' ? JSON.stringify(v).substring(0, 30) : String(v ?? '').substring(0, 30)}</td>;
                    })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </motion.div>
        );
      })()}

      {/* Remove Anomalies & Download */}
      {data.anomaly_count > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Remove Anomalies & Download Clean Dataset</h3>
              <p className="text-xs text-(--color-text-secondary) mb-3">
                Strip all {data.anomaly_count.toLocaleString()} flagged anomalous rows from your dataset and download a cleaned CSV file, ready for further analysis.
              </p>

              <AnimatePresence>
                {cleanResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 rounded-lg bg-green-500/5 border border-green-500/15"
                  >
                    <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-0.5">
                      <CheckCircle size={14} /> Cleaned Successfully
                    </div>
                    <div className="text-xs text-(--color-text-secondary)">
                      Removed <strong>{cleanResult.rowsRemoved}</strong> anomalous rows. Your cleaned dataset has <strong>{cleanResult.rowsRemaining}</strong> rows.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                {...buttonPress}
                onClick={handleCleanCSV}
                disabled={cleaning || !file}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 transition-opacity"
              >
                {cleaning ? (
                  <><Loader2 size={14} className="animate-spin" /> Cleaning...</>
                ) : (
                  <><Download size={14} /> Remove Anomalies & Download</>
                )}
              </motion.button>
              {!file && <p className="text-[11px] text-(--color-text-muted) mt-2">Upload a dataset in Workspace first to enable cleaning.</p>}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
