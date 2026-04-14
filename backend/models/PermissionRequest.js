const mongoose = require('mongoose');

const permissionRequestSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:    { type: String, required: true },
  userEmail:   { type: String, required: true },
  permission:  { type: String, enum: ['read', 'edit', 'delete', 'add'], required: true },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  actedBy:     { type: String, default: null },   // admin name who acted on it
}, { timestamps: true });

module.exports = mongoose.model('PermissionRequest', permissionRequestSchema);
