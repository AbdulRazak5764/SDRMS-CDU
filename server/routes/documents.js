const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('crypto');
const { db } = require('../db');
const { verifyToken, requireRoles, logAudit } = require('../auth');
const { getOrCreateStaffProfile } = require('../profileHelper');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, JPEG, PNG, and WebP files are permitted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB hard ceiling
});

// POST /api/documents/upload-photo
router.post('/upload-photo', verifyToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded.' });
  }

  const profile = getOrCreateStaffProfile(req.user);
  if (!profile) {
    return res.status(500).json({ error: 'Failed to access staff profile.' });
  }

  const photoUrl = `/api/documents/file/${req.file.filename}`;

  db.prepare('UPDATE staff_profiles SET photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(photoUrl, profile.id);

  logAudit(req.user.id, req.user.email, req.user.role, 'UPLOAD_PHOTO', 'staff_profiles', profile.id, `Uploaded passport photograph: ${req.file.originalname}`, req);

  res.json({
    message: 'Passport photograph uploaded successfully.',
    photo_url: photoUrl
  });
});

// POST /api/documents/upload
router.post('/upload', verifyToken, upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No document file provided.' });
  }

  const profile = getOrCreateStaffProfile(req.user);
  if (!profile) {
    return res.status(500).json({ error: 'Failed to access staff profile.' });
  }

  const { document_category, document_title, issuing_authority, issue_date, expiry_date } = req.body;
  if (!document_title) {
    return res.status(400).json({ error: 'Document title is required.' });
  }

  const docUuid = 'DOC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const stmt = db.prepare(`
    INSERT INTO documents (
      doc_uuid, staff_id, employee_id, document_category, document_title,
      issuing_authority, issue_date, expiry_date, original_filename, stored_filename,
      file_path, file_type, file_size, uploaded_by, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `);

  const info = stmt.run(
    docUuid,
    profile.id,
    profile.employee_id,
    document_category || 'General',
    document_title,
    issuing_authority || '',
    issue_date || null,
    expiry_date || null,
    req.file.originalname,
    req.file.filename,
    `uploads/${req.file.filename}`,
    req.file.mimetype,
    req.file.size,
    req.user.id
  );

  logAudit(req.user.id, req.user.email, req.user.role, 'UPLOAD_DOCUMENT', 'documents', info.lastInsertRowid, `Uploaded ${document_title} (${req.file.originalname})`, req);

  res.json({
    message: 'Document uploaded successfully.',
    document: {
      id: info.lastInsertRowid,
      doc_uuid: docUuid,
      document_title,
      document_category: document_category || 'General',
      original_filename: req.file.originalname,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      stored_filename: req.file.filename,
      verification_status: 'Pending'
    }
  });
});

// GET /api/documents/file/:filename
// Secure file streaming
router.get('/file/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // Protect against directory traversal
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server.' });
  }

  // Set appropriate content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.pdf') contentType = 'application/pdf';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// DELETE /api/documents/:id
router.delete('/:id', verifyToken, (req, res) => {
  const profile = getOrCreateStaffProfile(req.user);
  if (!profile) return res.status(500).json({ error: 'Staff profile not accessible.' });

  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND staff_id = ?').get(req.params.id, profile.id);
  if (!doc) return res.status(404).json({ error: 'Document not found or access denied.' });

  if (['Submitted', 'Under Verification', 'Approved'].includes(profile.workflow_status)) {
    return res.status(400).json({ error: 'Cannot remove documents while profile is locked.' });
  }

  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  logAudit(req.user.id, req.user.email, req.user.role, 'DELETE_DOCUMENT', 'documents', req.params.id, `Removed document ${doc.document_title}`, req);

  res.json({ message: 'Document removed successfully.' });
});

// PUT /api/documents/:id/verify
// For HOD, HR, Registrar
router.put('/:id/verify', verifyToken, requireRoles('hod', 'hr', 'registrar'), (req, res) => {
  const { status, remarks } = req.body;
  if (!status || !['Verified', 'Correction Required', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (Verified, Correction Required, Rejected) is required.' });
  }

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  db.prepare(`
    UPDATE documents SET
      verification_status = ?,
      verified_by = ?,
      verification_date = CURRENT_TIMESTAMP,
      remarks = ?
    WHERE id = ?
  `).run(status, req.user.id, remarks || '', req.params.id);

  logAudit(req.user.id, req.user.email, req.user.role, 'DOCUMENT_VERIFY', 'documents', req.params.id, `Verified document status: ${status}. Remarks: ${remarks || 'None'}`, req);

  res.json({ message: `Document marked as '${status}'.`, document_id: req.params.id });
});

module.exports = router;
