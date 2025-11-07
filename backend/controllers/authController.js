const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbHelper');

// Register new user with role
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'investor', wallet_balance = 1000 } = req.body;
    console.log('Registration attempt for:', { email, name, role });

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Validate role
    const validRoles = ['admin', 'entrepreneur', 'investor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, entrepreneur, or investor' });
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

    // Insert user with role
    console.log('Inserting new user with role:', role);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, wallet_balance) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, wallet_balance]
    );

    const userId = result.lastID;
    console.log('User created with ID:', userId);

    // Log user activity
    await db.run(
      'INSERT INTO user_activity_log (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
      [userId, 'registration', `User registered as ${role}`]
    );

    // Generate JWT token with role
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
        role,
        wallet_balance
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
    
    // Update last login
    await db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log user activity
    await db.run(
      'INSERT INTO user_activity_log (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
      [user.id, 'login', 'User logged in']
    );
    
    // Generate JWT token with role
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
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
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        is_verified: user.is_verified
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
      'SELECT id, name, email, role, wallet_balance, is_verified, profile_image, bio, phone, location, created_at FROM users WHERE id = ?',
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
