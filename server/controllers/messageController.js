const Message = require('../models/Message');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

// @desc    Get messages for a swap conversation
// @route   GET /api/messages/:swapId
// @access  Private
const getMessagesBySwapId = async (req, res, next) => {
  try {
    const { swapId } = req.params;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap conversation not found',
      });
    }

    // Verify user is a participant
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation',
      });
    }

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        swapId,
        receiverId: req.user.id,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      }
    );

    const messages = await Message.find({ swapId })
      .populate('senderId', 'name profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message within an accepted swap
// @route   POST /api/messages/:swapId
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { swapId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty',
      });
    }

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap conversation not found',
      });
    }

    // Verify user is a participant
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this swap',
      });
    }

    // Identify receiver (the other participant)
    const receiverId = swap.participants.find(
      (p) => p.toString() !== req.user.id.toString()
    );

    const newMessage = await Message.create({
      swapId,
      senderId: req.user.id,
      receiverId,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'senderId',
      'name profilePicture'
    );

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      type: 'NEW_MESSAGE',
      title: `New message from ${req.user.name}`,
      message: message.length > 60 ? `${message.substring(0, 57)}...` : message,
      relatedId: swapId,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessagesBySwapId,
  sendMessage,
};
