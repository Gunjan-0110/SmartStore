const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
