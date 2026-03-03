const express = require('express');
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/chatController');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many chat messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', chatLimiter, chat);

module.exports = router;
