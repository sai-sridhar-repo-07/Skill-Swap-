const express = require('express');
const router = express.Router();
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/session/:sessionId', protect, validate(schemas.createReview), createReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;
