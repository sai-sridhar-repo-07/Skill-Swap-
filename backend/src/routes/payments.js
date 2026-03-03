const express = require('express');
const { protect } = require('../middleware/auth');
const { createCheckoutSession, createSubscription, cancelSubscription } = require('../controllers/paymentController');

const router = express.Router();

// All payment routes require auth (webhook is mounted separately in app.js with raw body)
router.post('/checkout', protect, createCheckoutSession);
router.post('/subscribe', protect, createSubscription);
router.delete('/subscription', protect, cancelSubscription);

module.exports = router;
