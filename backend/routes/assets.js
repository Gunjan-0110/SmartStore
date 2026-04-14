const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const { name, category, sku, qty, safety, description, location } = req.body;
    const existing = await Asset.findOne({ sku: sku?.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'SKU already exists' });

    const asset = await Asset.create({
      name, category, sku, qty: parseInt(qty), safety: parseInt(safety),
      description: description || '', location: location || ''
    });

    await AuditLog.create({
      user: req.user.name, action: 'Created Asset', target: name, status: 'Success'
    });

    res.status(201).json({ success: true, asset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, category, sku, qty, safety, description, location } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { name, category, sku, qty: parseInt(qty), safety: parseInt(safety),
        description: description || '', location: location || '' },
      { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    await AuditLog.create({
      user: req.user.name, action: 'Updated Asset', target: name, status: 'Success'
    });

    res.json({ success: true, asset });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    await Asset.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.name, action: 'Deleted Asset', target: asset.name, status: 'Warning'
    });

    res.json({ success: true, message: 'Asset deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
