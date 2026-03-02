const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  skillTag: { type: String, required: true, index: true },
  category: String,
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: Number, required: true, min: 15, max: 60 },
  creditCost: { type: Number, required: true, min: 1, max: 50 },
  maxSeats: { type: Number, default: 1, min: 1, max: 20 },
  sessionType: { type: String, enum: ['one-to-one', 'group'], default: 'one-to-one' },
  bookedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming',
    index: true,
  },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date },
  actualStartTime: Date,
  actualEndTime: Date,
  roomId: { type: String, unique: true, sparse: true },
  recordingUrl: String,
  tags: [String],
  thumbnail: String,
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creditTransferred: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

sessionSchema.index({ startTime: 1, status: 1 });
sessionSchema.index({ skillTag: 1, status: 1 });
sessionSchema.index({ creditCost: 1 });
sessionSchema.index({ createdAt: -1 });

sessionSchema.virtual('seatsAvailable').get(function() {
  return this.maxSeats - (this.bookedUsers ? this.bookedUsers.length : 0);
});

sessionSchema.virtual('isFullyBooked').get(function() {
  return this.bookedUsers && this.bookedUsers.length >= this.maxSeats;
});

sessionSchema.pre('save', function(next) {
  if (this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  if (!this.roomId) {
    this.roomId = `room-${this._id.toString()}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
