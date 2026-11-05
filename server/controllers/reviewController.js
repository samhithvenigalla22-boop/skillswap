const Review = require('../models/Review');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit a review and rating for a completed swap
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { swapId, rating, comment } = req.body;

    if (!swapId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide swapId and rating (1 to 5)',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found',
      });
    }

    // Check if swap is completed
    if (swap.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed skill swaps',
      });
    }

    // Verify user is a participant
    const isParticipant = swap.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only participants of this completed swap can submit a review',
      });
    }

    // Determine reviewee (the other participant)
    const revieweeId = swap.participants.find(
      (p) => p.toString() !== req.user.id.toString()
    );

    // Prevent duplicate review for the same swap by this reviewer
    const existingReview = await Review.findOne({
      swapId,
      reviewerId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this completed swap',
      });
    }

    const review = await Review.create({
      swapId,
      reviewerId: req.user.id,
      revieweeId,
      rating: numRating,
      comment: comment ? comment.trim() : '',
    });

    // Notify reviewee
    await Notification.create({
      userId: revieweeId,
      type: 'NEW_REVIEW',
      title: 'New Review Received! ⭐',
      message: `${req.user.name} gave you a ${numRating}-star rating for your completed skill swap!`,
      relatedId: review._id,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews received by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'name profilePicture')
      .populate({
        path: 'swapId',
        select: 'offeredSkill requestedSkill completedAt',
        populate: [
          { path: 'offeredSkill', select: 'skillName category' },
          { path: 'requestedSkill', select: 'skillName category' },
        ],
      })
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating: avgRating,
      distribution,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
