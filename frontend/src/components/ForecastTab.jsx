import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, Package, Factory, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Repeat, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { stagger, fadeUp, spring } from '../lib/motion';

/* ─── Mini sparkline for table rows ─── */
function Sparkline({ data, color = 'var(--color-accent)', height = 32 }) {
  if (!data || data.length === 0) return <span className="text-xs text-(--color-text-muted)">—</span>;
  return (
    <ResponsiveContainer width={100} height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, '')})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Trend badge ─── */
function TrendBadge({ trend, changePct }) {
  const config = {
    Upward: { icon: TrendingUp, bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    Downward: { icon: TrendingDown, bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    Stable: { icon: Minus, bg: 'bg-(--color-bg-hover)', text: 'text-(--color-text-muted)', border: 'border-(--color-border)' },
  };
  const c = config[trend] || config.Stable;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <Icon size={10} />
      {trend} {changePct != null && `(${changePct > 0 ? '+' : ''}${changePct}%)`}
    </span>
  );
}

/* ─── Action badge for manufacturing recommendations ─── */
function ActionBadge({ action, urgency }) {
  const actionConfig = {
    increase: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: '↑ Increase' },
    decrease: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: '↓ Decrease' },
    hold: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: '→ Hold' },
  };
  const urgencyDot = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };
  const ac = actionConfig[action] || actionConfig.hold;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${ac.bg} ${ac.text} border ${ac.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot[urgency] || urgencyDot.low}`} />
      {ac.label}
    </span>
  );
}

/* ─── Main Forecast Tab ─── */
export default function ForecastTab({ data, retentionData }) {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const hasRetention = retentionData && !retentionData.error;

  const noData = !data && !hasRetention;
  if (noData) return <p className="text-sm text-(--color-text-muted) py-8 text-center">No forecast data available.</p>;

  // --- Overall forecast (existing) ---
  const forecastData = data?.forecast_data || [];
  const historicalData = data?.historical_data_sample || [];
  const allData = [...historicalData.map(d => ({ ...d, type: 'historical' })), ...forecastData.map(d => ({ ...d, type: 'forecast' }))];

  let trend = 'Stable';
  if (forecastData.length >= 2) {
    const first = forecastData[0]?.value || 0;
    const last = forecastData[forecastData.length - 1]?.value || 0;
    const change = ((last - first) / Math.max(first, 1)) * 100;
    if (change > 5) trend = 'Upward';
    else if (change < -5) trend = 'Downward';
  }

  const TrendIcon = trend === 'Upward' ? TrendingUp : trend === 'Downward' ? TrendingDown : Minus;
  const trendColor = trend === 'Upward' ? 'text-emerald-500' : trend === 'Downward' ? 'text-red-500' : 'text-(--color-text-muted)';
  const chartData = allData.length > forecastData.length ? allData : forecastData;

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-8">

      {/* ──── SECTION 1: Overall Forecast ──── */}
      {data && !data.error && (
        <>
          <motion.div variants={fadeUp}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-(--color-accent)" /> Overall Demand Forecast
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
              <div className="text-xs text-(--color-text-muted) mb-1">Trend</div>
              <div className={`text-xl font-bold flex items-center gap-2 ${trendColor}`}>
                <TrendIcon size={20} /> {trend}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
              <div className="text-xs text-(--color-text-muted) mb-1">Forecast Period</div>
              <div className="text-xl font-bold">{data.forecast_period_days || 30} days</div>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
              <div className="text-xs text-(--color-text-muted) mb-1">Target Column</div>
              <div className="text-xl font-bold truncate">{data.target_column_used || '—'}</div>
            </motion.div>
          </div>

          {chartData.length > 0 && (
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
              <h3 className="font-semibold text-sm mb-4">Forecast Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => v?.slice(5) || ''} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Value']}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-3 text-xs text-(--color-text-muted)">
                <span>Date column: {data.date_column_used || '—'}</span>
                <span>·</span>
                <span>Data points: {chartData.length}</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ──── SECTION 2: Product Retention Forecast ──── */}
      {hasRetention && (
        <>
          {/* Section header with gradient accent */}
          <motion.div variants={fadeUp} className="pt-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Repeat size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Product Retention Forecast</h3>
                <p className="text-xs text-(--color-text-muted)">Products driving repeat customers — with manufacturing recommendations</p>
              </div>
            </div>
          </motion.div>

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-center gap-1.5 text-xs text-(--color-text-muted) mb-1"><Users size={12} /> Returning Customers</div>
              <div className="text-2xl font-bold text-violet-500">{retentionData.returning_customer_count?.toLocaleString()}</div>
              <div className="text-xs text-(--color-text-muted) mt-1">out of {retentionData.total_customers?.toLocaleString()} total</div>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-center gap-1.5 text-xs text-(--color-text-muted) mb-1"><ShieldCheck size={12} /> Return Rate</div>
              <div className="text-2xl font-bold text-emerald-500">{retentionData.return_rate_pct}%</div>
              <div className="text-xs text-(--color-text-muted) mt-1">customers came back</div>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-fuchsia-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-center gap-1.5 text-xs text-(--color-text-muted) mb-1"><Package size={12} /> Top Retention Product</div>
              <div className="text-lg font-bold truncate">{retentionData.top_retention_products?.[0]?.product || '—'}</div>
              <div className="text-xs text-(--color-text-muted) mt-1">
                {retentionData.top_retention_products?.[0]?.retention_lift}x retention lift
              </div>
            </motion.div>
          </div>

          {/* ── Retention-Driving Products Table ── */}
          <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) overflow-hidden">
            <div className="px-5 py-4 border-b border-(--color-border)">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500" /> Retention-Driving Products
              </h4>
              <p className="text-xs text-(--color-text-muted) mt-0.5">Products that returning customers buy disproportionately more than one-time buyers</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-(--color-text-muted) border-b border-(--color-border)">
                    <th className="text-left px-5 py-3 font-medium">Product</th>
                    <th className="text-left px-3 py-3 font-medium">Category</th>
                    <th className="text-right px-3 py-3 font-medium">Returner Orders</th>
                    <th className="text-right px-3 py-3 font-medium">Retention Lift</th>
                    <th className="text-center px-3 py-3 font-medium">Trend</th>
                    <th className="text-center px-3 py-3 font-medium">Forecast</th>
                    <th className="text-right px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionData.top_retention_products?.map((prod, i) => (
                    <React.Fragment key={i}>
                      <motion.tr
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="border-b border-(--color-border) hover:bg-(--color-bg-hover)/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedProduct(expandedProduct === i ? null : i)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{prod.product}</span>
                            {expandedProduct === i ? <ChevronUp size={12} className="text-(--color-text-muted)" /> : <ChevronDown size={12} className="text-(--color-text-muted)" />}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-(--color-text-secondary)">{prod.category || '—'}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums">{prod.return_customer_orders?.toLocaleString()}</td>
                        <td className="px-3 py-3.5 text-right">
                          <span className={`font-semibold tabular-nums ${prod.retention_lift > 1.5 ? 'text-violet-500' : 'text-(--color-text)'}`}>
                            {prod.retention_lift}x
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <TrendBadge trend={prod.trend} changePct={prod.trend_change_pct} />
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <Sparkline data={prod.forecast_data} color={prod.trend === 'Upward' ? '#10b981' : prod.trend === 'Downward' ? '#ef4444' : 'var(--color-accent)'} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <ActionBadge action={prod.action} urgency={prod.urgency} />
                        </td>
                      </motion.tr>

                      {/* Expandable row with full chart */}
                      <AnimatePresence>
                        {expandedProduct === i && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ ...spring.gentle }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 py-5 bg-(--color-bg-hover)/30 border-b border-(--color-border)">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h5 className="font-semibold text-sm">{prod.product} — Demand Forecast</h5>
                                      <p className="text-xs text-(--color-text-muted) mt-0.5">
                                        {prod.return_customer_share_pct}% of returning customer orders vs {prod.one_time_buyer_share_pct}% of one-time buyers
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-(--color-text-muted)">Recommendation</div>
                                      <div className="text-xs font-medium mt-0.5 max-w-xs">{prod.recommendation}</div>
                                    </div>
                                  </div>
                                  {prod.forecast_data && prod.forecast_data.length > 0 && (
                                    <ResponsiveContainer width="100%" height={220}>
                                      <AreaChart data={[...(prod.historical_data || []).map(d => ({ ...d, type: 'hist' })), ...prod.forecast_data.map(d => ({ ...d, type: 'forecast' }))]}>
                                        <defs>
                                          <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickFormatter={v => v?.slice(5) || ''} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                                        <Tooltip
                                          contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 11 }}
                                          formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Value']}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fill={`url(#grad-${i})`} dot={false} isAnimationActive={true} animationDuration={1200} />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Manufacturing Recommendations Panel ── */}
          {retentionData.manufacturing_actions && retentionData.manufacturing_actions.length > 0 && (
            <motion.div variants={fadeUp} className="rounded-xl border border-(--color-border) bg-(--color-bg-card) p-5">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Factory size={14} className="text-fuchsia-500" /> Manufacturing Recommendations
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {retentionData.manufacturing_actions.map((action, i) => {
                  const borderColor = action.action === 'increase' ? 'border-emerald-500/30' : action.action === 'decrease' ? 'border-red-500/30' : 'border-amber-500/30';
                  const bgGlow = action.action === 'increase' ? 'from-emerald-500/5' : action.action === 'decrease' ? 'from-red-500/5' : 'from-amber-500/5';

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`rounded-xl border ${borderColor} bg-gradient-to-br ${bgGlow} to-transparent p-4`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm truncate max-w-[60%]">{action.product}</span>
                        <ActionBadge action={action.action} urgency={action.urgency} />
                      </div>
                      <p className="text-xs text-(--color-text-secondary) leading-relaxed">{action.reason}</p>
                      <div className="flex items-center gap-3 mt-3 text-[11px] text-(--color-text-muted)">
                        <span>Retention Lift: <strong className="text-violet-500">{action.retention_lift}x</strong></span>
                        <span>·</span>
                        <span>Trend: <strong className={action.trend_change_pct > 0 ? 'text-emerald-500' : action.trend_change_pct < 0 ? 'text-red-500' : ''}>{action.trend_change_pct > 0 ? '+' : ''}{action.trend_change_pct}%</strong></span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Quick Insight Banner ── */}
          {retentionData.top_retention_products?.length > 0 && (
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-transparent p-5"
            >
              <h4 className="font-semibold text-sm flex items-center gap-2 text-violet-500 mb-2">
                <Sparkles size={14} /> Key Insight
              </h4>
              <p className="text-xs text-(--color-text-secondary) leading-relaxed">
                <strong>{retentionData.return_rate_pct}%</strong> of your customers are repeat buyers.
                {' '}The product <strong>"{retentionData.top_retention_products[0]?.product}"</strong> has a{' '}
                <strong>{retentionData.top_retention_products[0]?.retention_lift}x retention lift</strong> — meaning returning customers
                are {retentionData.top_retention_products[0]?.retention_lift}x more likely to buy it than first-time buyers.
                {retentionData.top_retention_products[0]?.trend === 'Upward'
                  ? ' Demand is growing — consider increasing production capacity.'
                  : retentionData.top_retention_products[0]?.trend === 'Downward'
                    ? ' However, demand is declining — monitor closely before adjusting inventory.'
                    : ' Demand is stable — maintain current production levels.'}
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
