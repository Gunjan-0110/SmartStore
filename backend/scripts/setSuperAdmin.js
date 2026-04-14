/**
 * One-time migration: set isSuperAdmin = true for admin@smartstock.io
 * Run once from the backend folder: node scripts/setSuperAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await User.findOneAndUpdate(
    { email: 'admin@smartstock.io' },
    { $set: { isSuperAdmin: true } },
    { new: true }
  ).select('-password');

  if (!result) {
    console.error('❌ User admin@smartstock.io not found in DB.');
  } else {
    console.log(`✅ Super admin set: ${result.name} (${result.email})`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
