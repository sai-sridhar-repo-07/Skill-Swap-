const Session = require('../models/Session');
const User = require('../models/User');
const { getBalance, deductCredits, transferCredits, refundCredits, TRANSACTION_TYPES } = require('../services/creditService');
const { notifyBookingConfirmed, notifySessionCancelled, notifyCreditsReceived, notifySessionStarted } = require('../services/notificationService');
const { AppError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { paginate } = require('../utils/helpers');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

const createSession = async (req, res, next) => {
  try {
    const session = await Session.create({ ...req.body, hostId: req.user._id });
    
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { sessionsHosted: session._id },
    });
    
    await cacheDel('trending_sessions');
    
    res.status(201).json({ status: 'success', data: { session } });
  } catch (error) { next(error); }
};

const getSessions = async (req, res, next) => {
  try {
    const {
      page, limit, skill, level, minCost, maxCost,
      minRating, duration, search, status = 'upcoming', sort = '-createdAt'
    } = req.query;
    
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);
    
    const filter = { status };
    if (skill) filter.skillTag = { $regex: skill, $options: 'i' };
    if (level) filter.level = level;
    if (minCost || maxCost) {
      filter.creditCost = {};
      if (minCost) filter.creditCost.$gte = parseInt(minCost);
      if (maxCost) filter.creditCost.$lte = parseInt(maxCost);
    }
    if (duration) filter.duration = { $lte: parseInt(duration) };
    if (search) filter.$text = { $search: search };
    
    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('hostId', 'name avatar rating totalReviews skillsOffered')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Session.countDocuments(filter),
    ]);
    
    res.json({
      status: 'success',
      data: { sessions, total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) { next(error); }
};

const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('hostId', 'name avatar bio rating totalReviews skillsOffered')
      .populate('bookedUsers', 'name avatar');
    
    if (!session) throw new NotFoundError('Session not found');
    
    session.viewCount += 1;
    await session.save({ validateBeforeSave: false });
    
    res.json({ status: 'success', data: { session } });
  } catch (error) { next(error); }
};

const bookSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('hostId', 'name email');
    
    if (!session) throw new NotFoundError('Session not found');
    if (session.status !== 'upcoming') throw new AppError('Session is not available for booking', 400);
    if (session.hostId._id.toString() === req.user._id.toString()) {
      throw new AppError('Cannot book your own session', 400);
    }
    if (session.bookedUsers.includes(req.user._id)) {
      throw new AppError('Already booked this session', 409);
    }
    if (session.isFullyBooked) throw new AppError('Session is fully booked', 400);
    
    const balance = await getBalance(req.user._id);
    if (balance < session.creditCost) {
      throw new AppError(`Insufficient credits. Balance: ${balance}, Required: ${session.creditCost}`, 400);
    }
    
    await deductCredits(req.user._id, session.creditCost, TRANSACTION_TYPES.BOOKING, session._id, 'Session booking');
    
    session.bookedUsers.push(req.user._id);
    await session.save();
    
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { sessionsAttended: session._id },
    });
    
    await notifyBookingConfirmed(req.user._id, session.hostId._id, session);
    
    res.json({
      status: 'success',
      message: 'Session booked successfully',
      data: { session },
    });
  } catch (error) { next(error); }
};

const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) throw new NotFoundError('Session not found');
    
    const isHost = session.hostId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isHost && !isAdmin) throw new ForbiddenError('Not authorized to cancel this session');
    if (['completed', 'cancelled'].includes(session.status)) {
      throw new AppError('Session cannot be cancelled', 400);
    }
    
    for (const userId of session.bookedUsers) {
      await refundCredits(userId, session.creditCost, session._id, 'Session cancelled by host');
      await notifySessionCancelled(userId, session);
    }
    
    session.status = 'cancelled';
    session.cancellationReason = req.body.reason || 'Cancelled by host';
    session.cancelledBy = req.user._id;
    await session.save();
    
    res.json({ status: 'success', message: 'Session cancelled and credits refunded' });
  } catch (error) { next(error); }
};

const startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('bookedUsers', '_id');
    if (!session) throw new NotFoundError('Session not found');
    if (session.hostId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Only host can start session');
    }

    session.status = 'live';
    session.actualStartTime = new Date();
    await session.save();

    // Notify host + all students that session is live
    await notifySessionStarted(session.hostId, session.bookedUsers, session).catch(() => {});

    res.json({ status: 'success', data: { session } });
  } catch (error) { next(error); }
};

const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) throw new NotFoundError('Session not found');
    if (session.hostId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized');
    }
    if (session.status !== 'live') throw new AppError('Session must be live to complete', 400);
    if (session.creditTransferred) throw new AppError('Credits already transferred', 400);
    
    const totalCredits = session.creditCost * session.bookedUsers.length;
    if (totalCredits > 0) {
      await refundCredits(session.hostId, totalCredits, session._id, 'Teaching earnings');
      await notifyCreditsReceived(session.hostId, totalCredits, session.title);
    }
    
    session.status = 'completed';
    session.actualEndTime = new Date();
    session.creditTransferred = true;
    await session.save();
    
    res.json({ status: 'success', message: 'Session completed successfully', data: { session } });
  } catch (error) { next(error); }
};

const getTrendingSessions = async (req, res, next) => {
  try {
    const cached = await cacheGet('trending_sessions');
    if (cached) return res.json({ status: 'success', data: { sessions: cached } });
    
    const sessions = await Session.find({ status: 'upcoming' })
      .populate('hostId', 'name avatar rating')
      .sort({ viewCount: -1, bookedUsers: -1 })
      .limit(10)
      .lean();
    
    await cacheSet('trending_sessions', sessions, 300);
    res.json({ status: 'success', data: { sessions } });
  } catch (error) { next(error); }
};

const getMyHostedSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ hostId: req.user._id })
      .populate('bookedUsers', 'name avatar')
      .sort('-createdAt');
    res.json({ status: 'success', data: { sessions } });
  } catch (error) { next(error); }
};

const getMyBookedSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ bookedUsers: req.user._id })
      .populate('hostId', 'name avatar rating')
      .sort('-startTime');
    res.json({ status: 'success', data: { sessions } });
  } catch (error) { next(error); }
};

module.exports = {
  createSession, getSessions, getSessionById, bookSession,
  cancelSession, startSession, completeSession, getTrendingSessions,
  getMyHostedSessions, getMyBookedSessions,
};
