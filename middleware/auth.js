const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

 
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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return res.status(401).json({ message });
    }

    if (!decoded.sid) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    const session = await Session.findOne({
      _id: decoded.sid,
      userId: user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
};
