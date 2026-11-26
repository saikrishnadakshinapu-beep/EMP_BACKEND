const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  getSessions,
  logout,
  revokeSession,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/sessions', auth, getSessions);
router.delete('/sessions/:sessionId', auth, revokeSession);

module.exports = router;
