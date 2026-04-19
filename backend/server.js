require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const usageRoutes = require('./routes/usage');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'AutoML Studio API v3.0 is running.' });
});

// Start server first (always)
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
server.keepAliveTimeout = 120000;

// Database Connection (optional)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/automl_db';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(() => console.log('⚠️  MongoDB not available. Using in-memory stores.'));
