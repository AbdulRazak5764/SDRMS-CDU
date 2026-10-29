const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const { initSchema } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (port 5173 or other)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    institution: 'Chaitanya (Deemed to be University)',
    system: 'Staff Digital Records Management System (SDRMS)',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Client Error Logging Endpoint
app.post('/api/client-error', (req, res) => {
  console.error('[BROWSER CLIENT ERROR]:', JSON.stringify(req.body, null, 2));
  res.json({ received: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Serve built frontend assets in production if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Chaitanya (Deemed to be University) — SDRMS Server`);
  console.log(`Running securely on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
