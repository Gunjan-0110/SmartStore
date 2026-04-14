const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'Created Asset', 'Updated Asset', 'Deleted Asset',
      'Updated Inventory', 'Changed User Role', 'Added User',
      'Deleted User', 'Updated User', 'Login', 'Logout',
      'Approved Permission Request', 'Rejected Permission Request'
    ]
  },
  target:  { type: String, required: true },
  status:  { type: String, enum: ['Success', 'Warning', 'Error'], default: 'Success' },
  details: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
