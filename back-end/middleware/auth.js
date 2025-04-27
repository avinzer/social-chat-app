const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth; 