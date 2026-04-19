const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'automl_secret_key_2024';

// ─── In-Memory Usage Store ───
const usageLogs = [];

function authCheck(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch { return null; }
}

// ─── Log a usage event ───
router.post('/log', (req, res) => {
  const decoded = authCheck(req);
  if (!decoded) return res.status(401).json({ error: 'Auth required.' });

  const { action, filename, rowsProcessed, columnsProcessed, duration } = req.body;
  const log = {
    id: Date.now().toString(),
    userId: decoded.id,
    orgId: decoded.orgId || 'org_default',
    action: action || 'analysis',
    filename: filename || 'unknown',
    rowsProcessed: rowsProcessed || 0,
    columnsProcessed: columnsProcessed || 0,
    duration: duration || 0,
    timestamp: new Date()
  };
  usageLogs.push(log);
  res.status(201).json({ logged: true });
});

// ─── Get own usage stats ───
router.get('/me', (req, res) => {
  const decoded = authCheck(req);
  if (!decoded) return res.status(401).json({ error: 'Auth required.' });

  const myLogs = usageLogs.filter(l => l.userId === decoded.id);
  const totalAnalyses = myLogs.length;
  const totalRows = myLogs.reduce((sum, l) => sum + (l.rowsProcessed || 0), 0);

  // Last 7 days breakdown
  const now = new Date();
  const dailyCounts = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyCounts[key] = 0;
  }
  myLogs.forEach(l => {
    const key = new Date(l.timestamp).toISOString().split('T')[0];
    if (dailyCounts.hasOwnProperty(key)) dailyCounts[key]++;
  });

  const dailyChart = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  res.json({
    totalAnalyses,
    totalRows,
    recentLogs: myLogs.slice(-10).reverse(),
    dailyChart
  });
});

// ─── ADMIN: Platform-wide stats ───
router.get('/admin/stats', (req, res) => {
  const decoded = authCheck(req);
  if (!decoded || decoded.role !== 'admin') return res.status(403).json({ error: 'Admin required.' });

  const totalAnalyses = usageLogs.length;
  const totalRows = usageLogs.reduce((sum, l) => sum + (l.rowsProcessed || 0), 0);
  const uniqueUsers = [...new Set(usageLogs.map(l => l.userId))].length;

  // Per-org breakdown
  const orgStats = {};
  usageLogs.forEach(l => {
    if (!orgStats[l.orgId]) orgStats[l.orgId] = { analyses: 0, rows: 0 };
    orgStats[l.orgId].analyses++;
    orgStats[l.orgId].rows += l.rowsProcessed || 0;
  });

  // Daily for last 14 days
  const now = new Date();
  const dailyCounts = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyCounts[d.toISOString().split('T')[0]] = 0;
  }
  usageLogs.forEach(l => {
    const key = new Date(l.timestamp).toISOString().split('T')[0];
    if (dailyCounts.hasOwnProperty(key)) dailyCounts[key]++;
  });

  res.json({
    totalAnalyses,
    totalRows,
    uniqueUsers,
    orgStats,
    dailyChart: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })),
    recentLogs: usageLogs.slice(-20).reverse()
  });
});

module.exports = router;
