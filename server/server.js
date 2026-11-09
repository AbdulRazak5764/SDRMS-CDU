require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const { db, initSchema } = require('./db');
const { initNeonSchema, bootstrapSyncToNeon, isNeonConnected } = require('./neon');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Schema
initSchema();

// Initialize Neon PostgreSQL Cloud Database if DATABASE_URL is configured
initNeonSchema().then(connected => {
  if (connected) {
    bootstrapSyncToNeon(db);
  }
}).catch(err => {
  console.error('⚠️ [Neon Database Error]:', err.message);
});

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allows Vite HMR & dynamic client assets
}));

// 2. Strict CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for unauthorized origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body parsers with safe payload limits
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 4. Rate Limiting for Authentication (Brute Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per IP per 15 min
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 account creations per IP per hour
  message: { error: 'Registration rate limit exceeded from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limits to auth routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    institution: 'Chaitanya (Deemed to be University)',
    system: 'Staff Digital Records Management System (SDRMS)',
    version: '2.5.0-production-ready',
    security: 'Argon/Bcrypt cryptographically hashed, Rate-limited, Helmet protected',
    timestamp: new Date().toISOString()
  });
});

// Client Error Logging Endpoint
app.post('/api/client-error', (req, res) => {
  console.error('[BROWSER CLIENT ERROR]:', JSON.stringify(req.body, null, 2));
  res.json({ received: true });
});

// 6. Mount Core SDRMS API Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 7. Serve built frontend assets in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Chaitanya (Deemed to be University) — SDRMS Server`);
    console.log(`Running securely on: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Security: Helmet + Rate Limiter + Strict Cryptography active`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
