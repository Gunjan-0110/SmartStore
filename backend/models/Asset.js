const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Hardware', 'Accessories', 'Software', 'Other'],
    default: 'Other'
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  safety: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: { type: String, default: '' },
  location:    { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
