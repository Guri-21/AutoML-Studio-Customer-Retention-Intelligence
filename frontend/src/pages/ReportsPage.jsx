import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { stagger, fadeUp, cardHover, buttonPress, spring } from '../lib/motion';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5001/api/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data.analyses || []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReports();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-(--color-text) to-(--color-text-secondary) mb-1">
            Library / Reports
          </h2>
          <p className="text-sm text-(--color-text-secondary)">Access your previously generated ML analysis reports.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex space-x-2 justify-center items-center h-40">
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }} />
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.15 }} />
           <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.3 }} />
        </div>
      ) : reports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={spring.gentle}
          className="text-center py-20 border border-dashed border-(--color-border) rounded-2xl bg-(--color-bg-card)"
        >
          <FileText size={48} className="mx-auto text-(--color-text-muted) mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
          <p className="text-sm text-(--color-text-secondary) mb-6">Run an analysis in the Workspace to generate reports.</p>
          <motion.button 
            {...buttonPress} onClick={() => navigate('/app')}
            className="px-5 py-2.5 bg-(--color-bg-hover) text-(--color-text) rounded-xl font-medium text-sm transition-colors"
          >
            Go to Workspace
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          variants={stagger(0.08)} initial="hidden" animate="show"
          className="grid gap-4"
        >
          {reports.map((report) => (
            <motion.div 
              key={report._id} variants={fadeUp} whileHover={cardHover.hover} transition={cardHover.transition}
              className="p-4 rounded-xl border border-(--color-border) bg-(--color-bg-card) flex items-center justify-between cursor-pointer group hover:border-(--color-border-hover) transition-colors"
              onClick={() => navigate(`/app/reports/${report._id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-(--color-bg-hover) flex items-center justify-center text-(--color-text-secondary) group-hover:text-(--color-accent) group-hover:bg-(--color-accent)/10 transition-colors shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{report.filename} - Analysis Report</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-(--color-text-muted)">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(report.createdAt).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Activity size={12}/> {report.rowsProcessed?.toLocaleString()} rows</span>
                  </div>
                </div>
              </div>
              <motion.div 
                className="w-8 h-8 rounded-full bg-(--color-bg-hover) flex items-center justify-center text-(--color-text-secondary) group-hover:bg-(--color-accent) group-hover:text-white transition-colors"
              >
                <ArrowRight size={16} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
