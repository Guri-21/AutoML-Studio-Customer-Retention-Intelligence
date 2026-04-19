import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ResultsView } from '../components/Workspace';
import { ArrowLeft } from 'lucide-react';
import { spring, buttonPress } from '../lib/motion';

export default function ReportViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'anomaly', label: 'Anomalies' },
    { id: 'churn', label: 'Churn' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'profile', label: 'Profile' },
    { id: 'correlation', label: 'Correlations' },
    { id: 'health', label: 'Data Health' },
  ];

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5001/api/analysis/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // The endpoint returns { analysis: { ... } }
        // The results are stored inside analysis.results, but ResultsView expects
        // the top-level object to have filename, rows_processed, columns_processed, 
        // and the ML output like anomaly_analysis.
        // Let's map it back to shape expected by ResultsView.
        const data = res.data.analysis;
        const mappedAnalysis = {
          filename: data.filename,
          rows_processed: data.rowsProcessed,
          columns_processed: data.columnsProcessed,
          ...data.results // Spread the ML engine output
        };
        setAnalysis(mappedAnalysis);
      } catch (err) {
        setError('Failed to load analysis report.');
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchAnalysis();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div className="w-8 h-8 border-4 border-(--color-accent) border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
        <p className="text-(--color-text-secondary) mb-6">{error || 'This analysis may have been deleted.'}</p>
        <button className="text-(--color-accent) underline" onClick={() => navigate('/app/reports')}>Back to Reports</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 flex items-center gap-4">
        <motion.button 
          {...buttonPress} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-(--color-bg-card) border border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-hover) transition-colors"
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div className="text-sm font-medium text-(--color-text-secondary)">Back</div>
      </div>
      
      {/* We reuse the precise ResultsView structure! */}
      <ResultsView 
        analysis={analysis} 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReset={() => navigate('/app')} 
      />
    </div>
  );
}
