import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, ShieldAlert, TrendingUp } from 'lucide-react';

export default function Dashboard({ data, onReset }) {
  if (!data || data.status !== 'success') {
    return (
        <div className="card">
            <h3>Analysis Failed</h3>
            <p>The Express proxy forwarded the file, but the Python FastAPI did not return a valid success payload.</p>
            <p style={{color: '#ef4444'}}>{data?.detail || JSON.stringify(data)}</p>
            <button onClick={onReset}>Try Again</button>
        </div>
    );
  }

  const anomalyData = data.anomaly_analysis || {};
  const tsData = data.time_series_forecast || {};
  
  // Format graph data
  const chartData = tsData.forecast_data ? [...(tsData.historical_data_sample || []), ...tsData.forecast_data] : [];

  return (
    <div style={{animation: 'fadeIn 0.5s'}}>
      <button onClick={onReset} className="btn btn-outline" style={{marginBottom: '1.5rem'}}>
        <ArrowLeft size={16} /> <span style={{marginLeft: '0.5rem'}}>Back to Upload Workspace</span>
      </button>

      <div className="dashboard-grid" style={{marginTop: '0'}}>
         <div className="glass-card metric-box" style={{borderLeftColor: '#3b82f6', padding: '1.5rem'}}>
             <div className="metric-title" style={{color: 'var(--text-secondary)'}}>Total Rows Analyzed</div>
             <div className="metric-value" style={{color: 'white', fontSize: '2rem'}}>{data.rows_processed?.toLocaleString() || 0}</div>
         </div>
         <div className="glass-card metric-box" style={{borderLeftColor: anomalyData.anomaly_count > 0 ? '#ef4444' : '#10b981', padding: '1.5rem'}}>
             <div className="metric-title" style={{color: 'var(--text-secondary)'}}>Anomalies Detected</div>
             <div className="metric-value" style={{color: 'white', fontSize: '2rem'}}>{anomalyData.anomaly_count?.toLocaleString() || 0} <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>({anomalyData.anomaly_percentage}%)</span></div>
         </div>
         <div className="glass-card metric-box" style={{borderLeftColor: '#f59e0b', padding: '1.5rem'}}>
             <div className="metric-title" style={{color: 'var(--text-secondary)'}}>Forecast Variable</div>
             <div className="metric-value" style={{textTransform: 'capitalize', color: 'white'}}>{tsData.target_column_used || 'Unknown'}</div>
         </div>
      </div>

      <div className="glass-card" style={{minHeight: '400px', marginTop: '2rem'}}>
         <h2 style={{display: 'flex', alignItems: 'center', color: 'white', marginBottom: '2rem'}}>
             <TrendingUp color="#3b82f6" style={{marginRight: '1rem'}}/> 30-Day Predictive Forecast
         </h2>
         {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155"/>
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} tickMargin={10} minTickGap={30} />
                  <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} width={80} />
                  <Tooltip contentStyle={{background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '8px'}} itemStyle={{color: '#60a5fa'}} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Projected Value" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 8, fill: '#60a5fa', stroke: '#fff'}} />
                </LineChart>
             </ResponsiveContainer>
         ) : (
             <p style={{color: '#94a3b8'}}>Could not run Time-Series Forecasting. Ensure the CSV contains a valid Date column and a numeric value column.</p>
         )}
      </div>

      {anomalyData.anomaly_count > 0 && (
         <div className="glass-card" style={{borderTop: '4px solid #ef4444', marginTop: '2rem'}}>
             <h2 style={{display: 'flex', alignItems: 'center', color: 'white'}}>
                 <ShieldAlert color="#ef4444" style={{marginRight: '1rem'}}/> Unsupervised Anomaly Detection Report
             </h2>
             <p style={{color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: '1.6'}}>
                 The <strong>Isolation Forest</strong> algorithm detected <strong>{anomalyData.anomaly_count}</strong> mathematically extreme outlier records out of {data.rows_processed} total records. 
                 By running an unsupervised clustering split on the numerical dimensions, the AI noted intense deviations from your data's normal signature.
             </p>
             <div style={{background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem'}}>
                 <h4 style={{marginBottom: '1.5rem', color: '#fca5a5', fontSize: '1.1rem'}}>Key Drivers (Why these were flagged)</h4>
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem'}}>
                     {(anomalyData.top_anomaly_drivers || []).map((driver, idx) => (
                         <div key={idx} style={{background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)'}}>
                             <div style={{color: 'white', fontWeight: 'bold', marginBottom: '0.5rem'}}>{driver}</div>
                             <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
                                 <span>Normal: <strong style={{color: '#10b981'}}>{anomalyData.normal_profile_means?.[driver]}</strong></span>
                                 <span>Anomaly: <strong style={{color: '#ef4444'}}>{anomalyData.anomaly_profile_means?.[driver]}</strong></span>
                             </div>
                         </div>
                     ))}
                 </div>
                 <p style={{marginTop: '1.5rem', fontSize: '0.875rem', color: '#fca5a5'}}>
                     <em>Note: Extreme deviations frequently cluster around B2B bulk orders or unverified fraudulent retail transactions.</em>
                 </p>
             </div>
         </div>
      )}
    </div>
  );
}
