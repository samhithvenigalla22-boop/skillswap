const Session = require('../models/Session');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

// Helper to validate that endTime is chronologically after startTime
const isEndTimeAfterStartTime = (startTime, endTime) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return false;
  }
  return endH * 60 + endM > startH * 60 + startM;
};

// @desc    Create a new learning session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { swapId, title, description, scheduledDate, startTime, endTime, meetingLink } =
      req.body;

    if (!swapId || !title || !scheduledDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide swapId, title, scheduled date, start time, and end time',
      });
    }

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found',
      });
    }

    // Verify user is a participant
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only participants of this swap can schedule sessions',
      });
    }

    if (swap.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule session for a swap that is ${swap.status.toLowerCase()}`,
      });
    }

    // Validate times
    if (!isEndTimeAfterStartTime(startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Session end time must be later than start time',
      });
    }

    const sessionDate = new Date(scheduledDate);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduled date format',
      });
    }

    const session = await Session.create({
      swapId,
      title: title.trim(),
      description: description ? description.trim() : '',
      scheduledDate: sessionDate,
      startTime,
      endTime,
      meetingLink: meetingLink ? meetingLink.trim() : '',
      status: 'Scheduled',
      createdBy: req.user.id,
    });

    // Notify other participant
    const partnerId = swap.participants.find(
      (p) => p.toString() !== req.user.id.toString()
    );

    if (partnerId) {
      await Notification.create({
        userId: partnerId,
        type: 'SESSION_SCHEDULED',
        title: 'New Learning Session Scheduled 📅',
        message: `${req.user.name} scheduled a session: "${title}" on ${sessionDate.toLocaleDateString()} at ${startTime}`,
        relatedId: session._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Learning session scheduled successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sessions for current user (or filtered by swapId)
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { swapId, status } = req.query;

    let query = {};

    if (swapId) {
      const swap = await Swap.findById(swapId);
      if (!swap) {
        return res.status(404).json({
          success: false,
          message: 'Swap not found',
        });
      }
      query.swapId = swapId;
    } else {
      // Find all swaps the user participates in
      const userSwaps = await Swap.find({ participants: req.user.id }).select('_id');
      const swapIds = userSwaps.map((s) => s._id);
      query.swapId = { $in: swapIds };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('createdBy', 'name profilePicture')
      .populate({
        path: 'swapId',
        populate: [
          { path: 'participants', select: 'name profilePicture' },
          { path: 'offeredSkill', select: 'skillName category' },
          { path: 'requestedSkill', select: 'skillName category' },
        ],
      })
      .sort({ scheduledDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('createdBy', 'name profilePicture')
      .populate({
        path: 'swapId',
        populate: [
          { path: 'participants', select: 'name profilePicture email' },
          { path: 'offeredSkill', select: 'skillName category' },
          { path: 'requestedSkill', select: 'skillName category' },
        ],
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const swap = await Swap.findById(session.swapId);
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only participants can update this session',
      });
    }

    const { title, description, scheduledDate, startTime, endTime, meetingLink, status } =
      req.body;

    if (startTime && endTime && !isEndTimeAfterStartTime(startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be later than start time',
      });
    }

    if (title) session.title = title.trim();
    if (description !== undefined) session.description = description.trim();
    if (scheduledDate) session.scheduledDate = new Date(scheduledDate);
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (meetingLink !== undefined) session.meetingLink = meetingLink.trim();
    if (status && ['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      session.status = status;
    }

    const updatedSession = await session.save();

    // Notify other participant
    const partnerId = swap.participants.find(
      (p) => p.toString() !== req.user.id.toString()
    );
    if (partnerId) {
      await Notification.create({
        userId: partnerId,
        type: 'SESSION_UPDATED',
        title: 'Session Updated',
        message: `${req.user.name} updated the session: "${session.title}"`,
        relatedId: session._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or cancel a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const swap = await Swap.findById(session.swapId);
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only swap participants can cancel or delete this session',
      });
    }

    session.status = 'Cancelled';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session status set to Cancelled',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark session as completed
// @route   PUT /api/sessions/:id/complete
// @access  Private
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.status = 'Completed';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session marked as completed',
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  completeSession,
};
