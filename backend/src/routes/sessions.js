const express = require('express');
const router = express.Router();
const {
  createSession, getSessions, getSessionById, bookSession,
  cancelSession, startSession, completeSession, getTrendingSessions,
  getMyHostedSessions, getMyBookedSessions,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/', getSessions);
router.get('/trending', getTrendingSessions);
router.get('/my/hosted', protect, getMyHostedSessions);
router.get('/my/booked', protect, getMyBookedSessions);
router.post('/', protect, validate(schemas.createSession), createSession);
router.get('/:id', getSessionById);
router.post('/:id/book', protect, apiLimiter, bookSession);
router.post('/:id/cancel', protect, cancelSession);
router.post('/:id/start', protect, startSession);
router.post('/:id/complete', protect, completeSession);

module.exports = router;
