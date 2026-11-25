const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads the token from the request header:
//   Authorization: Bearer <token>
// (x-auth-token: <token> is also accepted)
module.exports = async function auth(req, res, next) {
  try {
    let token;
    const header = req.headers.authorization;

    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required: missing token in headers' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
};
