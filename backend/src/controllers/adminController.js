const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { addCredits, getBalance, query } = require('../services/creditService');
const { TRANSACTION_TYPES } = require('../services/creditService');
const { AppError, NotFoundError } = require('../utils/errors');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalSessions, completedSessions, activeUsers] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      User.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);
    
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email avatar createdAt');
    const recentSessions = await Session.find().sort('-createdAt').limit(5)
      .populate('hostId', 'name').select('title status creditCost createdAt');
    
    const totalCreditsResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM credit_ledger WHERE amount > 0');
    
    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalSessions,
          completedSessions,
          activeUsers,
          totalCreditsInSystem: parseFloat(totalCreditsResult.rows[0].total),
        },
        recentUsers,
        recentSessions,
      },
    });
  } catch (error) { next(error); }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (status === 'banned') filter.isBanned = true;
    if (status === 'active') filter.isBanned = false;
    
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)).select('-password -refreshToken'),
      User.countDocuments(filter),
    ]);
    
    res.json({
      status: 'success',
      data: { users, total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'admin') throw new AppError('Cannot ban admin users', 400);
    
    user.isBanned = !user.isBanned;
    user.banReason = req.body.reason || '';
    await user.save();
    
    res.json({
      status: 'success',
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
    });
  } catch (error) { next(error); }
};

const adjustCredits = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) throw new NotFoundError('User not found');
    
    await addCredits(user._id, amount, TRANSACTION_TYPES.ADMIN_ADJUST, null, reason || 'Admin adjustment');
    const newBalance = await getBalance(user._id);
    
    res.json({ status: 'success', message: 'Credits adjusted', data: { newBalance } });
  } catch (error) { next(error); }
};

const moderateSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};
    
    const [sessions, total] = await Promise.all([
      Session.find(filter).populate('hostId', 'name email').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Session.countDocuments(filter),
    ]);
    
    res.json({ status: 'success', data: { sessions, total } });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats, getUsers, banUser, adjustCredits, moderateSessions };
