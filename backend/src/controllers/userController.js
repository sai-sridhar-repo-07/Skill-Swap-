const User = require('../models/User');
const Session = require('../models/Session');
const { getBalanceFull, getTransactionHistory } = require('../services/creditService');
const { sanitizeUser, paginate } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('sessionsHosted', 'title skillTag status')
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    
    if (!user || !user.isActive) throw new NotFoundError('User not found');
    
    const stats = await getBalanceFull(user._id);
    
    res.json({
      status: 'success',
      data: { user: { ...sanitizeUser(user), creditStats: stats } },
    });
  } catch (error) { next(error); }
};

const getProfileBySlug = async (req, res, next) => {
  try {
    const user = await User.findOne({ profileShareSlug: req.params.slug, isActive: true })
      .select('name avatar bio skillsOffered rating totalReviews sessionsHosted profileShareSlug');
    if (!user) throw new NotFoundError('Profile not found');
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skillsOffered, skillsWanted, availability } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (skillsOffered) updates.skillsOffered = skillsOffered;
    if (skillsWanted) updates.skillsWanted = skillsWanted;
    if (availability) updates.availability = availability;
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ status: 'success', data: { user: sanitizeUser(user) } });
  } catch (error) { next(error); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const avatarUrl = req.file.location || req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ status: 'success', data: { avatar: avatarUrl, user: sanitizeUser(user) } });
  } catch (error) { next(error); }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await getTransactionHistory(req.user._id, parseInt(page) || 1, parseInt(limit) || 20);
    res.json({ status: 'success', data });
  } catch (error) { next(error); }
};

const bookmarkSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const sessionId = req.params.sessionId;
    const idx = user.bookmarkedSessions.indexOf(sessionId);
    
    if (idx === -1) {
      user.bookmarkedSessions.push(sessionId);
    } else {
      user.bookmarkedSessions.splice(idx, 1);
    }
    await user.save();
    res.json({ status: 'success', data: { bookmarked: idx === -1 } });
  } catch (error) { next(error); }
};

const searchTeachers = async (req, res, next) => {
  try {
    const { skill, level, minRating, page, limit } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);
    
    const filter = { isActive: true, isBanned: false };
    if (skill) filter['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    if (level) filter['skillsOffered.level'] = level;
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    
    const teachers = await User.find(filter)
      .select('name avatar bio skillsOffered rating totalReviews')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({ status: 'success', data: { teachers } });
  } catch (error) { next(error); }
};

const getSkillSuggestions = async (req, res, next) => {
  try {
    const skills = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);
    res.json({ status: 'success', data: { skills } });
  } catch (error) { next(error); }
};

const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('avatar bio skillsOffered availability rating totalReviews badges streak');
    if (!user || !user.isActive) throw new NotFoundError('User not found');

    const sessionsCompleted = await Session.countDocuments({ hostId: req.params.id, status: 'completed' });

    // Profile completionPct: 5 checkpoints × 20% each
    let completionPct = 0;
    if (user.avatar) completionPct += 20;
    if (user.bio && user.bio.length > 20) completionPct += 20;
    if (user.skillsOffered && user.skillsOffered.length > 0) completionPct += 20;
    if (user.availability && user.availability.length > 0) completionPct += 20;
    if (user.rating > 0) completionPct += 20;

    const topSkills = (user.skillsOffered || []).slice(0, 3).map((s) => ({ name: s.name, level: s.level }));

    res.json({
      status: 'success',
      data: {
        sessionsCompleted,
        rating: user.rating,
        totalReviews: user.totalReviews,
        topSkills,
        badges: user.badges || [],
        streak: user.streak || 0,
        completionPct,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getProfile, getProfileBySlug, updateProfile, uploadAvatar, getMyTransactions, bookmarkSession, searchTeachers, getSkillSuggestions, getUserStats };
