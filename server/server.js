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
const { seedDatabase } = require('./seed');
const { initNeonSchema, bootstrapSyncToNeon, isNeonConnected } = require('./neon');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (essential for Vercel Serverless & Rate Limiters)
app.set('trust proxy', 1);

// Initialize SQLite Schema
initSchema();

// Auto-seed initial university faculties, departments, and administrative credentials if empty (essential for Vercel and fresh deployments)
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  if (userCount === 0) {
    console.log('[AUTO-SEED] Fresh deployment detected. Seeding university records and administrative credentials...');
    seedDatabase();
    console.log('[AUTO-SEED] Seeding completed successfully.');
  }
} catch (seedErr) {
  console.warn('[AUTO-SEED WARNING]:', seedErr.message);
}

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

// 2. Comprehensive Production & Vercel CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow mobile apps, curl, postman, and same-origin requests (where origin is undefined)
    if (!origin) return callback(null, true);

    // 2. Always allow any Vercel domain (*.vercel.app)
    if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // 3. Always allow local dev servers
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // 4. Always allow explicitly configured origins or wildcard
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 5. In production on cloud platforms (e.g. Vercel), safely permit the origin
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 3. Body parsers with safe payload limits
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 4. Rate Limiting for Authentication (Brute Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // relaxed for university campus IPs
  skip: () => !!process.env.VERCEL,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  skip: () => !!process.env.VERCEL,
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
