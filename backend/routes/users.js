const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users — Admin only
router.post('/', adminOnly, async (req, res) => {
  try {
    const { email, password, name, role, permissions } = req.body;
    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = await User.create({
      email, password, name,
      role: role || 'User',
      permissions: permissions || { read: true, edit: false, delete: false, add: false }
    });

    await AuditLog.create({
      user: req.user.name, action: 'Added User', target: name, status: 'Success'
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id — Admin only
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name, role, permissions } = req.body;
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const roleChanged = existing.role !== role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, permissions },
      { new: true }
    ).select('-password');

    await AuditLog.create({
      user: req.user.name,
      action: roleChanged ? 'Changed User Role' : 'Updated User',
      target: name, status: 'Success'
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/:id — Admin only
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.name, action: 'Deleted User', target: user.name, status: 'Warning'
    });

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
