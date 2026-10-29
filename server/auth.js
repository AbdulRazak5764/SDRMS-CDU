const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'chaitanya-university-sdrms-secure-secret-2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      employee_id: user.employee_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      department_id: user.department_id,
      faculty_id: user.faculty_id,
      category: user.category
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
      });
    }
    next();
  };
}

function logAudit(userId, userEmail, role, action, entityType, entityId, details, req) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, user_email, role, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      userId || null,
      userEmail || 'system',
      role || 'system',
      action,
      entityType,
      String(entityId || ''),
      typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      String(ip)
    );
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireRoles,
  logAudit
};
