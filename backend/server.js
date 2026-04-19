require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes     = require('./routes/auth');
const uploadRoutes   = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const usageRoutes    = require('./routes/usage');
const chatRoutes     = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 5001;

// ─── Trust Render/Vercel reverse proxy ───
app.set('trust proxy', 1);

// ─── Security headers ───
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── Gzip compression ───
app.use(compression());

// ─── CORS ───
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173', // Vite preview
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Rate limiting ───
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ─── Body parsing ───
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Routes ───
app.use('/api/auth',     authRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/usage',    usageRoutes);
app.use('/api/chat',     chatRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'AutoML Studio API v4.0 is running.' });
});

// ─── Start server ───
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);
server.keepAliveTimeout = 120000;

// ─── MongoDB Atlas connection ───
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/automl_db';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.log('⚠️  MongoDB not available:', err.message));

