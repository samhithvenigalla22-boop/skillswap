const SwapRequest = require('../models/SwapRequest');
const Swap = require('../models/Swap');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Session = require('../models/Session');
const Message = require('../models/Message');

// Helper to send in-app notification
const createNotification = async ({ userId, type, title, message, relatedId }) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
    });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

// @desc    Create a new swap request
// @route   POST /api/swaps/request
// @access  Private
const createSwapRequest = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId, offeredSkillId, requestedSkillId, message } = req.body;

    if (!receiverId || !offeredSkillId || !requestedSkillId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver, offered skill, and requested skill',
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a skill swap with yourself',
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found or account is inactive',
      });
    }

    // Verify offered skill belongs to sender
    const offeredSkill = await Skill.findById(offeredSkillId);
    if (!offeredSkill || offeredSkill.userId.toString() !== senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Offered skill does not exist or does not belong to you',
      });
    }

    // Verify requested skill belongs to receiver
    const requestedSkill = await Skill.findById(requestedSkillId);
    if (!requestedSkill || requestedSkill.userId.toString() !== receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Requested skill does not exist or does not belong to the recipient',
      });
    }

    // Check for existing pending request
    const existingPending = await SwapRequest.findOne({
      senderId,
      receiverId,
      offeredSkillId,
      requestedSkillId,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A pending swap request for these skills is already active',
      });
    }

    const swapRequest = await SwapRequest.create({
      senderId,
      receiverId,
      offeredSkillId,
      requestedSkillId,
      message: message ? message.trim() : '',
      status: 'Pending',
    });

    // Notify receiver
    await createNotification({
      userId: receiverId,
      type: 'SWAP_REQUEST',
      title: 'New Skill Swap Request!',
      message: `${req.user.name} sent you a swap request: "${offeredSkill.skillName}" for "${requestedSkill.skillName}"`,
      relatedId: swapRequest._id,
    });

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully',
      swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get swap requests sent by current user
// @route   GET /api/swaps/sent
// @access  Private
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await SwapRequest.find({ senderId: req.user.id })
      .populate('receiverId', 'name email profilePicture bio location')
      .populate('offeredSkillId')
      .populate('requestedSkillId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get swap requests received by current user
// @route   GET /api/swaps/received
// @access  Private
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await SwapRequest.find({ receiverId: req.user.id })
      .populate('senderId', 'name email profilePicture bio location')
      .populate('offeredSkillId')
      .populate('requestedSkillId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a swap request
// @route   PUT /api/swaps/:id/accept
// @access  Private
const acceptSwapRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('offeredSkillId')
      .populate('requestedSkillId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found',
      });
    }

    if (request.receiverId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept this swap request',
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be accepted because it is already ${request.status.toLowerCase()}`,
      });
    }

    request.status = 'Accepted';
    await request.save();

    // Create Active Swap
    const swap = await Swap.create({
      requestId: request._id,
      participants: [request.senderId, request.receiverId],
      offeredSkill: request.offeredSkillId._id,
      requestedSkill: request.requestedSkillId._id,
      status: 'Active',
      startedAt: Date.now(),
    });

    // Notify sender that request was accepted
    await createNotification({
      userId: request.senderId,
      type: 'SWAP_ACCEPTED',
      title: 'Swap Request Accepted! 🎉',
      message: `${req.user.name} accepted your swap request for "${request.requestedSkillId?.skillName}". You can now chat and schedule sessions!`,
      relatedId: swap._id,
    });

    res.status(200).json({
      success: true,
      message: 'Swap request accepted successfully. Active swap created!',
      swap,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a swap request
// @route   PUT /api/swaps/:id/reject
// @access  Private
const rejectSwapRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found',
      });
    }

    if (request.receiverId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject this request',
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}`,
      });
    }

    request.status = 'Rejected';
    await request.save();

    // Notify sender
    await createNotification({
      userId: request.senderId,
      type: 'SWAP_REJECTED',
      title: 'Swap Request Declined',
      message: `${req.user.name} was unable to accept your swap request at this time.`,
      relatedId: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Swap request rejected',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a swap request (by sender)
// @route   PUT /api/swaps/:id/cancel
// @access  Private
const cancelSwapRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found',
      });
    }

    if (request.senderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can cancel this request',
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status.toLowerCase()}`,
      });
    }

    request.status = 'Cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Swap request cancelled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active swaps for current user
// @route   GET /api/swaps/active
// @access  Private
const getActiveSwaps = async (req, res, next) => {
  try {
    const statusFilter = req.query.status || 'Active';

    let query = {
      participants: req.user.id,
    };

    if (statusFilter !== 'All') {
      query.status = statusFilter;
    }

    const swaps = await Swap.find(query)
      .populate('participants', 'name email profilePicture bio location')
      .populate('offeredSkill')
      .populate('requestedSkill')
      .sort({ updatedAt: -1 });

    // Fetch upcoming sessions count and latest message for each swap
    const swapsWithDetails = await Promise.all(
      swaps.map(async (swap) => {
        const upcomingSessions = await Session.find({
          swapId: swap._id,
          status: 'Scheduled',
        }).sort({ scheduledDate: 1, startTime: 1 });

        const latestMessage = await Message.findOne({ swapId: swap._id }).sort({ createdAt: -1 });

        const partner = swap.participants.find(
          (p) => p._id.toString() !== req.user.id.toString()
        );

        return {
          ...swap.toObject(),
          partner,
          upcomingSessionsCount: upcomingSessions.length,
          nextSession: upcomingSessions[0] || null,
          latestMessage,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: swapsWithDetails.length,
      swaps: swapsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a swap
// @route   PUT /api/swaps/:id/complete
// @access  Private
const completeSwap = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id).populate('participants', 'name');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found',
      });
    }

    const isParticipant = swap.participants.some(
      (p) => p._id.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this swap',
      });
    }

    if (swap.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This swap has already been marked as completed',
      });
    }

    swap.status = 'Completed';
    swap.completedAt = new Date();
    await swap.save();

    // Update related SwapRequest
    if (swap.requestId) {
      await SwapRequest.findByIdAndUpdate(swap.requestId, { status: 'Completed' });
    }

    // Notify other participant
    const partner = swap.participants.find(
      (p) => p._id.toString() !== req.user.id.toString()
    );

    if (partner) {
      await createNotification({
        userId: partner._id,
        type: 'SWAP_COMPLETED',
        title: 'Skill Swap Completed! 🎓',
        message: `${req.user.name} marked your skill swap as completed. Please leave a review and rating!`,
        relatedId: swap._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill swap marked as completed! Both participants can now submit reviews.',
      swap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get swap details by ID
// @route   GET /api/swaps/:id
// @access  Private
const getSwapById = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('participants', 'name email profilePicture bio location')
      .populate('offeredSkill')
      .populate('requestedSkill');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found',
      });
    }

    const isParticipant = swap.participants.some(
      (p) => p._id.toString() === req.user.id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this swap',
      });
    }

    const partner = swap.participants.find(
      (p) => p._id.toString() !== req.user.id.toString()
    );

    res.status(200).json({
      success: true,
      swap: {
        ...swap.toObject(),
        partner,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSwapRequest,
  getSentRequests,
  getReceivedRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  getActiveSwaps,
  completeSwap,
  getSwapById,
};
