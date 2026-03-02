const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { notifyReviewReceived } = require('../services/notificationService');
const { AppError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const { paginate } = require('../utils/helpers');

const createReview = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) throw new NotFoundError('Session not found');
    if (session.status !== 'completed') throw new AppError('Can only review completed sessions', 400);
    
    const isParticipant = session.bookedUsers.some(id => id.toString() === req.user._id.toString());
    const isHost = session.hostId.toString() === req.user._id.toString();
    if (!isParticipant && !isHost) throw new ForbiddenError('Must be session participant to review');
    
    const existing = await Review.findOne({ sessionId: session._id, reviewerId: req.user._id });
    if (existing) throw new ConflictError('Already reviewed this session');
    
    const targetUserId = isParticipant ? session.hostId : session.bookedUsers[0];
    
    const review = await Review.create({
      sessionId: session._id,
      reviewerId: req.user._id,
      targetUserId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    
    await User.findById(targetUserId).then(u => u?.updateRating(req.body.rating));
    await notifyReviewReceived(targetUserId, req.body.rating, session.title);
    
    res.status(201).json({ status: 'success', data: { review } });
  } catch (error) { next(error); }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);
    
    const [reviews, total] = await Promise.all([
      Review.find({ targetUserId: req.params.userId, isPublic: true })
        .populate('reviewerId', 'name avatar')
        .populate('sessionId', 'title skillTag')
        .sort('-createdAt')
        .skip(skip).limit(limitNum),
      Review.countDocuments({ targetUserId: req.params.userId, isPublic: true }),
    ]);
    
    res.json({ status: 'success', data: { reviews, total } });
  } catch (error) { next(error); }
};

module.exports = { createReview, getUserReviews };
