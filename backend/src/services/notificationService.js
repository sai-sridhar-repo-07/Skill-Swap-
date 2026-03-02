const Notification = require('../models/Notification');
const { logger } = require('../utils/logger');

let io;
const userSockets = new Map();

const init = (socketIo) => { io = socketIo; };
const registerUserSocket = (userId, socketId) => { userSockets.set(userId.toString(), socketId); };
const removeUserSocket = (userId) => { userSockets.delete(userId.toString()); };

const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await Notification.create({ userId, type, title, message, data });
    
    const socketId = userSockets.get(userId.toString());
    if (io && socketId) {
      io.to(socketId).emit('notification', {
        id: notification._id,
        type, title, message, data,
        createdAt: notification.createdAt,
      });
    }
    return notification;
  } catch (error) {
    logger.error('Notification creation failed:', error);
  }
};

const notifyBookingConfirmed = async (learnerId, teacherId, session) => {
  await Promise.all([
    createNotification(learnerId, 'booking_confirmed', 'Booking Confirmed!',
      `Your booking for "${session.title}" is confirmed.`, { sessionId: session._id }),
    createNotification(teacherId, 'booking_confirmed', 'New Booking!',
      `${session.title} has a new booking.`, { sessionId: session._id }),
  ]);
};

const notifySessionCancelled = async (userId, session) => {
  await createNotification(userId, 'session_cancelled', 'Session Cancelled',
    `"${session.title}" has been cancelled. Credits refunded.`, { sessionId: session._id });
};

const notifyCreditsReceived = async (userId, amount, sessionTitle) => {
  await createNotification(userId, 'credit_received', 'Credits Received!',
    `You earned ${amount} credits for teaching "${sessionTitle}".`);
};

const notifyReviewReceived = async (userId, rating, sessionTitle) => {
  await createNotification(userId, 'review_received', 'New Review!',
    `You received a ${rating}-star review for "${sessionTitle}".`);
};

const notifySessionStarted = async (hostId, bookedUsers, session) => {
  await createNotification(hostId, 'session_started', 'Your session is live!',
    `"${session.title}" is now live.`, { sessionId: session._id });

  const studentIds = bookedUsers.map((u) => u._id || u);
  await Promise.all(
    studentIds.map((userId) =>
      createNotification(userId, 'session_started', '🔴 Session is Live!',
        `"${session.title}" has started. Join now!`, { sessionId: session._id })
    )
  );

  // Real-time clickable alert so students get it instantly
  if (io) {
    studentIds.forEach((userId) => {
      const sid = userSockets.get(userId.toString());
      if (sid) io.to(sid).emit('session-live', { sessionId: session._id.toString(), title: session.title });
    });
  }
};

module.exports = {
  init, registerUserSocket, removeUserSocket,
  createNotification, notifyBookingConfirmed, notifySessionCancelled,
  notifyCreditsReceived, notifyReviewReceived, notifySessionStarted,
};
