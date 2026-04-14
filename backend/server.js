const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes  = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const userRoutes  = require('./routes/users');
const logRoutes   = require('./routes/logs');

const app = express();

app.use(cors({ origin: /^http:\/\/localhost:\d+$/, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users',  userRoutes);
app.use('/api/logs',   logRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5002,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  await seedDatabase();
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

async function seedDatabase() {
  const User     = require('./models/User');
  const Asset    = require('./models/Asset');
  const AuditLog = require('./models/AuditLog');

  if ((await User.countDocuments()) === 0) {
    await User.create([
      {
        email: 'admin@smartstock.io',
        password: 'admin123',
        name: 'Admin User',
        role: 'Admin',
        permissions: { read: true, edit: true, delete: true, add: true }
      },
      {
        email: 'demo@smartstock.io',
        password: 'demo123',
        name: 'Demo User',
        role: 'User',
        permissions: { read: true, edit: true, delete: false, add: true }
      }
    ]);
    console.log('✓ Seeded default users');
  }

  if ((await Asset.countDocuments()) === 0) {
    await Asset.create([
      { name: 'Dell XPS 15 Laptop',    category: 'Electronics', sku: 'ELEC-DXPS-001', qty: 45, safety: 20 },
      { name: 'Logitech MX Master 3',  category: 'Electronics', sku: 'ELEC-LMXM-002', qty: 12, safety: 15 },
      { name: 'Cisco Router WRT3200',  category: 'Hardware',    sku: 'HARD-CRTR-003', qty: 5,  safety: 10 },
      { name: 'Samsung Monitor 27"',   category: 'Electronics', sku: 'ELEC-SM27-004', qty: 78, safety: 30 },
      { name: 'Industrial Battery Pack',category:'Hardware',    sku: 'HARD-IBP-005',  qty: 0,  safety: 25 },
      { name: 'USB-C Cable 2m',        category: 'Accessories', sku: 'ACC-USBC-006',  qty: 150,safety: 50 },
    ]);
    console.log('✓ Seeded default assets');
  }

  if ((await AuditLog.countDocuments()) === 0) {
    await AuditLog.create([
      { user: 'Admin User', action: 'Created Asset',    target: 'Dell XPS 15 Laptop',  status: 'Success' },
      { user: 'Demo User',  action: 'Updated Asset',    target: 'Cisco Router WRT3200', status: 'Success' },
      { user: 'Admin User', action: 'Changed User Role',target: 'Demo User',            status: 'Success' },
    ]);
    console.log('✓ Seeded default audit logs');
  }
}
