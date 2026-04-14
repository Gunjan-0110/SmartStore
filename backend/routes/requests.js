const express = require('express');
const router = express.Router();
const PermissionRequest = require('../models/PermissionRequest');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// POST /api/requests — user submits a permission request
router.post('/', async (req, res) => {
  try {
    const { permission } = req.body;
    if (!['read', 'edit', 'delete', 'add'].includes(permission))
      return res.status(400).json({ success: false, message: 'Invalid permission type' });

    // Block if already has permission
    if (req.user.permissions[permission])
      return res.status(400).json({ success: false, message: `You already have the "${permission}" permission` });

    // Block if a pending request already exists
    const existing = await PermissionRequest.findOne({
      userId: req.user._id, permission, status: 'pending'
    });
    if (existing)
      return res.status(409).json({ success: false, message: 'A pending request for this permission already exists' });

    const request = await PermissionRequest.create({
      userId:    req.user._id,
      userName:  req.user.name,
      userEmail: req.user.email,
      permission,
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/requests/mine — user fetches their own requests
router.get('/mine', async (req, res) => {
  try {
    const requests = await PermissionRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/requests — admin fetches all requests
router.get('/', adminOnly, async (req, res) => {
  try {
    const requests = await PermissionRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/requests/:id — admin approves or rejects
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(action))
      return res.status(400).json({ success: false, message: 'Action must be "approved" or "rejected"' });

    const request = await PermissionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending')
      return res.status(400).json({ success: false, message: 'This request has already been acted upon' });

    request.status  = action;
    request.actedBy = req.user.name;
    await request.save();

    // If approved, update the user's permission
    if (action === 'approved') {
      await User.findByIdAndUpdate(request.userId, {
        [`permissions.${request.permission}`]: true
      });
    }

    await AuditLog.create({
      user: req.user.name,
      action: `${action === 'approved' ? 'Approved' : 'Rejected'} Permission Request`,
      target: `${request.userName} — ${request.permission}`,
      status: action === 'approved' ? 'Success' : 'Warning'
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
