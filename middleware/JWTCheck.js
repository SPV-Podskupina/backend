const jwt = require('jsonwebtoken');

const tokenBlacklist = new Set();


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing JWT token' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ message: 'Token has been revoked' });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid JWT token' });
    }
    req.user = user;
    next();
  });
}

module.exports = module.exports = {
  authenticateToken,
  tokenBlacklist
};