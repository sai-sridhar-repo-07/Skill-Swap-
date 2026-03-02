const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerUserSocket, removeUserSocket } = require('../services/notificationService');
const { logger } = require('../utils/logger');

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.name} (${socket.id})`);
    registerUserSocket(socket.user._id, socket.id);
    socket.join(`user:${socket.user._id}`);

    // WebRTC Signaling
    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });
      logger.info(`${socket.user.name} joined room ${roomId}`);
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId: socket.user._id });
    });

    socket.on('offer', ({ roomId, offer, targetId }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.user._id, name: socket.user.name });
    });

    socket.on('answer', ({ roomId, answer, targetId }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.user._id });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.user._id });
    });

    // Chat
    socket.on('chat-message', ({ roomId, message }) => {
      const msg = {
        id: Date.now(),
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar,
        message: message.substring(0, 500),
        timestamp: new Date(),
      };
      io.to(roomId).emit('chat-message', msg);
    });

    // Host controls
    socket.on('raise-hand', ({ roomId }) => {
      socket.to(roomId).emit('hand-raised', { userId: socket.user._id, name: socket.user.name });
    });

    socket.on('lower-hand', ({ roomId }) => {
      socket.to(roomId).emit('hand-lowered', { userId: socket.user._id });
    });

    socket.on('remove-user', ({ roomId, userId }) => {
      const targetSocket = [...io.sockets.sockets.values()]
        .find(s => s.user?._id?.toString() === userId);
      if (targetSocket) {
        targetSocket.leave(roomId);
        targetSocket.emit('removed-from-room', { reason: 'Removed by host' });
      }
    });

    socket.on('end-session', ({ roomId }) => {
      io.to(roomId).emit('session-ended', { message: 'Session ended by host' });
    });

    // Whiteboard
    socket.on('whiteboard-draw', ({ roomId, ...drawData }) => {
      socket.to(roomId).emit('whiteboard-draw', drawData);
    });

    socket.on('whiteboard-clear', ({ roomId }) => {
      socket.to(roomId).emit('whiteboard-clear');
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user.name}`);
      removeUserSocket(socket.user._id);
    });
  });
};

module.exports = { initSocket };
