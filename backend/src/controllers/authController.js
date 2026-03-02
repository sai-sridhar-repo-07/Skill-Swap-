const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, generateResetToken, sanitizeUser } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { signupBonus } = require('../services/creditService');
const { AppError, AuthError, ConflictError, NotFoundError } = require('../utils/errors');
const { logger } = require('../utils/logger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) throw new ConflictError('Email already registered');
    
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    
    const user = await User.create({
      name, email, password,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    
    await signupBonus(user._id);
    
    try {
      await sendVerificationEmail(user, verifyToken);
    } catch (emailErr) {
      logger.warn('Verification email failed:', emailErr.message);
    }
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email.',
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      throw new AuthError('Invalid email or password');
    }
    
    if (user.isBanned) throw new AppError('Account suspended. Contact support.', 403);
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });
    
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({
      status: 'success',
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) throw new AuthError('No refresh token');
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== token) throw new AuthError('Invalid refresh token');
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ status: 'success', data: { accessToken } });
  } catch (error) { next(error); }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    
    if (!user) throw new AppError('Invalid or expired verification token', 400);
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.json({ status: 'success', message: 'Email verified successfully' });
  } catch (error) { next(error); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ status: 'success', message: 'If that email exists, a reset link was sent.' });
    }
    
    const { token, hashed } = generateResetToken();
    user.passwordResetToken = hashed;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    
    try {
      await sendPasswordResetEmail(user, token);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Email send failed. Try again.', 500);
    }
    
    res.json({ status: 'success', message: 'Password reset link sent to email.' });
  } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    
    if (!user) throw new AppError('Invalid or expired reset token', 400);
    
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
    
    res.json({ status: 'success', message: 'Password reset successful. Please log in.' });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const { getBalance } = require('../services/creditService');
    const balance = await getBalance(req.user._id);
    res.json({
      status: 'success',
      data: { user: { ...sanitizeUser(req.user), creditsBalance: balance } },
    });
  } catch (error) { next(error); }
};

module.exports = { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword, getMe };
