const express = require('express');
const router = express.Router();
const db = require('../database/dbHelper');
const bcrypt = require('bcryptjs');

// Get all users (for debugging)
router.get('/users', async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, name, email, wallet_balance, created_at FROM users'
    );
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await db.all(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    res.json({
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed test user
router.post('/seed-user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const result = await db.run(
      `INSERT INTO users (name, email, password, wallet_balance) 
       VALUES (?, ?, ?, ?)`,
      ['Saathvik', 'saathvikk202@gmail.com', hashedPassword, 10000.00]
    );

    res.json({
      message: 'Test user created successfully',
      userId: result.lastID,
      credentials: {
        email: 'saathvikk202@gmail.com',
        password: 'password123'
      }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Database stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM pledges) as total_pledges,
        (SELECT COALESCE(SUM(wallet_balance), 0) FROM users) as total_wallet_balance
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
