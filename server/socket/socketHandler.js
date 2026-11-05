const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Message = require('../models/Message');

const onlineUsers = new Map(); // userId -> Set of socketIds

const initSocket = (io) => {
  // Socket.IO Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication required for WebSocket connection'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('User not found or suspended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired WebSocket authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status to everyone
    io.emit('user_status', {
      userId,
      isOnline: true,
      onlineUserIds: Array.from(onlineUsers.keys()),
    });

    // Provide initial list of online users to the newly connected user
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    // Join a swap conversation room
    socket.on('join_swap', async (swapId) => {
      try {
        const swap = await Swap.findById(swapId);
        if (!swap) {
          return socket.emit('error', { message: 'Swap not found' });
        }

        const isParticipant = swap.participants.some(
          (p) => p.toString() === userId
        );

        if (!isParticipant && socket.user.role !== 'admin') {
          return socket.emit('error', { message: 'Not authorized for this swap room' });
        }

        socket.join(`swap:${swapId}`);
        socket.emit('joined_swap', { swapId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave a swap conversation room
    socket.on('leave_swap', (swapId) => {
      socket.leave(`swap:${swapId}`);
    });

    // Real-time message sending
    socket.on('send_message', async ({ swapId, message }) => {
      try {
        if (!message || message.trim() === '') return;

        const swap = await Swap.findById(swapId);
        if (!swap) {
          return socket.emit('error', { message: 'Swap not found' });
        }

        const isParticipant = swap.participants.some(
          (p) => p.toString() === userId
        );

        if (!isParticipant) {
          return socket.emit('error', { message: 'Unauthorized to send message in this swap' });
        }

        const receiverId = swap.participants.find(
          (p) => p.toString() !== userId
        );

        // Save message in DB
        const newMessage = await Message.create({
          swapId,
          senderId: userId,
          receiverId,
          message: message.trim(),
        });

        const populatedMessage = await Message.findById(newMessage._id).populate(
          'senderId',
          'name profilePicture'
        );

        // Broadcast to swap room
        io.to(`swap:${swapId}`).emit('receive_message', populatedMessage);

        // Emit direct notification to receiver's personal room
        io.to(`user:${receiverId}`).emit('new_message_notification', {
          swapId,
          senderName: socket.user.name,
          message: message.trim(),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicators
    socket.on('typing', ({ swapId }) => {
      socket.to(`swap:${swapId}`).emit('user_typing', {
        swapId,
        userId,
        userName: socket.user.name,
      });
    });

    socket.on('stop_typing', ({ swapId }) => {
      socket.to(`swap:${swapId}`).emit('user_stop_typing', {
        swapId,
        userId,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status', {
            userId,
            isOnline: false,
            onlineUserIds: Array.from(onlineUsers.keys()),
          });
        }
      }
    });
  });
};

module.exports = { initSocket };
