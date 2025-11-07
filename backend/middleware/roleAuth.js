const db = require('../database/dbHelper');

// Check if user has required role
exports.requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!userRole) {
        return res.status(403).json({ error: 'Access denied. No role found.' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

// Check if user has specific permission
exports.requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Check permission in database
      const permission = await db.get(
        'SELECT * FROM permissions WHERE role = ? AND resource = ? AND action = ? AND granted = 1',
        [userRole, resource, action]
      );

      if (!permission) {
        return res.status(403).json({ 
          error: 'Access denied. You do not have permission to perform this action.',
          required: { resource, action },
          role: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Check if user is admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is entrepreneur
exports.requireEntrepreneur = (req, res, next) => {
  if (req.user.role !== 'entrepreneur' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Entrepreneurs only.' });
  }
  next();
};

// Check if user is investor
exports.requireInvestor = (req, res, next) => {
  if (req.user.role !== 'investor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Investors only.' });
  }
  next();
};

module.exports = exports;
