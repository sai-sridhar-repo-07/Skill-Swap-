const express = require('express');
const router = express.Router();
const {
  register, login, refreshToken, logout,
  verifyEmail, forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', strictLimiter, validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', strictLimiter, validate(schemas.resetPassword), resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
