import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, BarChart3, Users } from 'lucide-react';
import { stagger, fadeUp } from '../lib/motion';

export default function OverviewTab({ data }) {
  if (!data) return null;

  const anomalyCount = data.anomaly_analysis?.anomaly_count || 0;
  const churnSegments = data.churn_prediction?.segment_counts || {};
  const highRisk = churnSegments['High Risk'] || 0;

  const metrics = [
    { label: 'Rows Processed', value: data.rows_processed?.toLocaleString(), icon: <BarChart3 size={16} />, color: 'text-(--color-accent)' },
    { label: 'Columns', value: data.columns_processed, icon: <BarChart3 size={16} />, color: 'text-purple-500' },
    { label: 'Anomalies', value: anomalyCount, icon: <AlertTriangle size={16} />, color: 'text-amber-500' },
    { label: 'Churn Risk', value: highRisk, icon: <Users size={16} />, color: 'text-red-500' },
  ];

  const pipelines = [
    { name: 'Data Profiling', ok: !!data.profile },
    { name: 'Anomaly Detection', ok: !!data.anomaly_analysis },
    { name: 'Churn Prediction', ok: !!data.churn_prediction },
    { name: 'Time-Series Forecast', ok: !!data.time_series_forecast },
    { name: 'Correlation Analysis', ok: !!data.correlation },
    { name: 'Distribution Analysis', ok: !!data.distribution },
  ];

  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
            <div className="flex items-center gap-1.5 text-xs text-(--color-text-muted) mb-1">{m.icon} {m.label}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
        <h3 className="font-semibold text-sm mb-3">Pipeline Status</h3>
        <div className="space-y-2">
          {pipelines.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-(--color-border) last:border-0 text-sm">
              <span>{p.name}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.ok ? 'bg-green-500/10 text-green-500' : 'bg-(--color-bg-hover) text-(--color-text-muted)'}`}>{p.ok ? 'Complete' : 'Skipped'}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {anomalyCount > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-500 mb-2"><AlertTriangle size={16} /> We found {anomalyCount} anomalies</h3>
          <p className="text-xs text-(--color-text-secondary)">Switch to the Anomalies tab to investigate flagged records and understand potential fraud patterns.</p>
        </motion.div>
      )}

      {highRisk > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-red-500 mb-2"><Brain size={16} /> {highRisk} customers are at high churn risk</h3>
          <p className="text-xs text-(--color-text-secondary)">View the Churn tab for risk segmentation and feature importance analysis.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
