const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, banUser, adjustCredits, moderateSessions } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:userId/ban', banUser);
router.post('/users/:userId/credits', adjustCredits);
router.get('/sessions', moderateSessions);

module.exports = router;
