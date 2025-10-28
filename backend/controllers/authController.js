const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbHelper');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, wallet_balance = 1000 } = req.body; // Set default wallet balance
    console.log('Registration attempt for:', { email, name });

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    console.log('Inserting new user...');
    const result = await db.run(
      'INSERT INTO users (name, email, password, wallet_balance) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, wallet_balance]
    );

    const userId = result.lastID;
    console.log('User created with ID:', userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt with data:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    console.log('Searching for user with email:', email);
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, checking password...');
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password matched, generating token...');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', email);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await db.get(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
