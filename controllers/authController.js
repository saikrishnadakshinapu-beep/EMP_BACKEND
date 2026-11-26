const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');

const createSession = async (user, req) => {
  const sessionId = new mongoose.Types.ObjectId();
  const token = jwt.sign({ id: user._id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  const { exp } = jwt.decode(token);

  const session = await Session.create({
    _id: sessionId,
    userId: user._id,
    userName: user.name,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    expiresAt: new Date(exp * 1000),
  });

  return { token, session };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const { token, session } = await createSession(user, req);
    res.status(201).json({
      message: 'User registered',
      token,
      session: {
        id: session._id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { token, session } = await createSession(user, req);
    res.json({
      message: 'Login successful',
      token,
      session: {
        id: session._id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      revokedAt: null,
      // expiresAt: { $gt: new Date() },
    }) 
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      sessions: sessions.map(({ _id, ...session }) => ({
        id: _id,
        ...session,
      })),
    });
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    await Session.updateOne(
      { _id: req.session._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.revokeSession = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.sessionId)) {
      return res.status(400).json({ message: 'Invalid session id' });
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user._id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { revokedAt: new Date() } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    res.json({ message: 'Session revoked successfully' });
  } catch (err) {
    next(err);
  }
};
