const express = require('express');
const router = express.Router();
const { verifyToken } = require('../auth');
const { db } = require('../db');
const { getNotificationsForUser } = require('../notifications');

// GET /api/notifications - Real-time alerts & clearance notifications for logged-in user
router.get('/', verifyToken, (req, res) => {
  try {
    const notifications = getNotificationsForUser(req.user);
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', verifyToken, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications SET is_read = 1
      WHERE user_id = ?
         OR (target_role = ? AND (department_id = ? OR department_id IS NULL))
         OR (target_role = 'registrar' AND ? IN ('registrar', 'vc', 'hr'))
    `).run(req.user.id, req.user.role, req.user.department_id || null, req.user.role);

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

module.exports = router;

