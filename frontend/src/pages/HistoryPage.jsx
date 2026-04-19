import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, FileText, UploadCloud, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { stagger, fadeUp, buttonPress, spring } from '../lib/motion';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5001/api/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.analyses || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-(--color-text) to-(--color-text-secondary) mb-1">
            Analysis History
          </h2>
          <p className="text-sm text-(--color-text-secondary)">A timeline of your recent automated ML executions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex space-x-2 justify-center items-center h-40">
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }} />
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.15 }} />
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.3 }} />
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={spring.gentle}
          className="text-center py-20 border border-dashed border-(--color-border) rounded-2xl bg-(--color-bg-card)"
        >
          <Clock size={48} className="mx-auto text-(--color-text-muted) mb-4" />
          <h3 className="text-lg font-semibold mb-2">No history yet</h3>
          <p className="text-sm text-(--color-text-secondary) mb-6">Your activity timeline will appear here once you run an analysis.</p>
          <motion.button 
            {...buttonPress} onClick={() => navigate('/app')}
            className="px-5 py-2.5 bg-(--color-bg-hover) text-(--color-text) rounded-xl font-medium text-sm transition-colors"
          >
            Start First Analysis
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          variants={stagger(0.08)} initial="hidden" animate="show"
          className="relative border-l border-(--color-border) ml-4 py-4 space-y-8"
        >
          {history.map((item, index) => (
            <motion.div 
              key={item._id} variants={fadeUp}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[5px] top-6 w-[9px] h-[9px] rounded-full bg-(--color-accent) ring-4 ring-(--color-bg)" />
              
              <div 
                onClick={() => navigate(`/app/reports/${item._id}`)}
                className="p-5 rounded-2xl border border-(--color-border) bg-(--color-bg-card) hover:border-(--color-border-hover) transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-(--color-accent)/10 flex items-center justify-center text-(--color-accent) shrink-0 mt-1 group-hover:bg-(--color-accent)/20 transition-colors">
                     <Activity size={18} />
                   </div>
                   <div>
                     <h3 className="font-semibold text-sm">Automated ML Pipeline Execution</h3>
                     <p className="text-sm text-(--color-text-secondary) mt-0.5">Dataset <strong>{item.filename}</strong> processed successfully ({item.rowsProcessed?.toLocaleString()} rows).</p>
                     <div className="flex items-center gap-3 mt-3 text-[11px] text-(--color-text-muted) font-medium uppercase tracking-wider">
                       <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(item.createdAt).toLocaleString()}</span>
                     </div>
                   </div>
                </div>

                <motion.div 
                  className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--color-bg) bg-(--color-text) hover:opacity-90 rounded-lg transition-opacity whitespace-nowrap"
                >
                  <FileText size={14} /> Full Report
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
