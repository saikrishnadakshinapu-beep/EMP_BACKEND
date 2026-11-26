const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
