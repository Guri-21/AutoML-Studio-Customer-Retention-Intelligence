import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, FileSpreadsheet, Calendar, ChevronRight, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { stagger, fadeUp, cardHover, buttonPress, spring } from '../lib/motion';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5001/api/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // The API returns analyses. We'll treat each successfully analyzed file as a dataset.
        setDatasets(res.data.analyses || []);
      } catch (err) {
        console.error("Failed to fetch datasets", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDatasets();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-(--color-text) to-(--color-text-secondary) mb-1">
            Library / Datasets
          </h2>
          <p className="text-sm text-(--color-text-secondary)">Manage and view your uploaded data.</p>
        </div>
        <motion.button 
          {...buttonPress}
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 px-4 py-2 bg-(--color-text) text-(--color-bg) rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <UploadCloud size={16} /> New Dataset
        </motion.button>
      </div>

      {loading ? (
        <div className="flex space-x-2 justify-center items-center h-40">
          <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }} />
          <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.15 }} />
          <motion.div className="w-2 h-2 rounded-full bg-(--color-accent)" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.3 }} />
        </div>
      ) : datasets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={spring.gentle}
          className="text-center py-20 border border-dashed border-(--color-border) rounded-2xl bg-(--color-bg-card)"
        >
          <Database size={48} className="mx-auto text-(--color-text-muted) mb-4" />
          <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
          <p className="text-sm text-(--color-text-secondary) mb-6">Upload a CSV file in the Workspace to begin analysis.</p>
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
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {datasets.map((ds) => (
            <motion.div 
              key={ds._id} variants={fadeUp} whileHover={cardHover.hover} transition={cardHover.transition}
              className="p-5 rounded-2xl border border-(--color-border) bg-(--color-bg-card) flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-(--color-accent)/10 flex items-center justify-center text-(--color-accent) shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{ds.filename}</h3>
                    <p className="text-xs text-(--color-text-muted) flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> {new Date(ds.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-(--color-bg-hover) rounded-lg p-2.5">
                    <div className="text-[10px] uppercase font-semibold text-(--color-text-muted) mb-1">Rows Processed</div>
                    <div className="text-sm font-medium">{ds.rowsProcessed?.toLocaleString() || '---'}</div>
                  </div>
                  <div className="bg-(--color-bg-hover) rounded-lg p-2.5">
                    <div className="text-[10px] uppercase font-semibold text-(--color-text-muted) mb-1">Columns</div>
                    <div className="text-sm font-medium">{ds.columnsProcessed?.toLocaleString() || '---'}</div>
                  </div>
                </div>
              </div>
              
              <motion.button 
                {...buttonPress}
                onClick={() => navigate(`/app/reports/${ds._id}`)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-(--color-accent) bg-(--color-accent)/5 hover:bg-(--color-accent)/10 rounded-lg transition-colors cursor-pointer"
              >
                View Analysis <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
