const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  category: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8, select: false },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  refreshToken: { type: String, select: false },
  googleId: String,
  skillsOffered: [skillSchema],
  skillsWanted: [skillSchema],
  availability: [{
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    slots: [{ start: String, end: String }],
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  sessionsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  sessionsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  bookmarkedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  badges: [{ name: String, awardedAt: Date }],
  streak: { type: Number, default: 0 },
  lastActiveAt: Date,
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  profileShareSlug: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.index({ email: 1 });
userSchema.index({ skillsOffered: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ profileShareSlug: 1 });

userSchema.virtual('creditsBalance').get(function() {
  return this._creditsBalance || 0;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (this.isNew && !this.profileShareSlug) {
    this.profileShareSlug = `${this.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating * this.totalReviews + newRating;
  this.totalReviews += 1;
  this.rating = totalRating / this.totalReviews;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
