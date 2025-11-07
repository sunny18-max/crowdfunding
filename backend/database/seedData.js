const bcrypt = require('bcryptjs');

// Minimal seed data
async function getSeedData() {
  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Single admin user
  const users = [
    {
      name: 'Admin User',
      email: 'admin@fundstarter.com',
      password: hashedPassword,
      role: 'admin',
      wallet_balance: 100000,
      bio: 'Platform administrator',
      phone: '+1-555-0000',
      location: 'San Francisco, CA',
      is_verified: 1
    }
  ];

  // Empty campaigns and pledges
  const campaigns = [];
  const pledges = [];

  return { users, campaigns, pledges };
}

module.exports = { getSeedData };
