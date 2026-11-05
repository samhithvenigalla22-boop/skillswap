const Skill = require('../models/Skill');
const User = require('../models/User');
const Review = require('../models/Review');
const { calculateMatchScore } = require('../utils/matchingAlgorithm');

// @desc    Get complementary skill matches for the current user
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Fetch current user's skills
    const mySkills = await Skill.find({ userId: currentUserId });
    const userAOffers = mySkills.filter((s) => s.skillType === 'Offer');
    const userAWants = mySkills.filter((s) => s.skillType === 'Want');

    if (userAOffers.length === 0 && userAWants.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        matches: [],
        message:
          'Please add at least one skill you can teach (Offer) and one skill you want to learn (Want) to discover matches.',
      });
    }

    // Fetch all other active users
    const candidateUsers = await User.find({
      _id: { $ne: currentUserId },
      isActive: true,
    }).select('-password');

    const matches = [];

    for (const candidate of candidateUsers) {
      const candidateSkills = await Skill.find({ userId: candidate._id });
      const userBOffers = candidateSkills.filter((s) => s.skillType === 'Offer');
      const userBWants = candidateSkills.filter((s) => s.skillType === 'Want');

      if (userBOffers.length === 0 && userBWants.length === 0) {
        continue;
      }

      // Calculate matching metrics
      const matchResult = calculateMatchScore({
        userAOffers,
        userAWants,
        userBOffers,
        userBWants,
        userBProfile: candidate,
      });

      if (matchResult && (matchResult.canTeachYou.length > 0 || matchResult.youCanTeach.length > 0)) {
        // Fetch candidate reviews
        const reviews = await Review.find({ revieweeId: candidate._id });
        const avgRating =
          reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 0;

        matches.push({
          user: {
            ...candidate.toObject(),
            averageRating: avgRating,
            reviewCount: reviews.length,
            offeredSkills: userBOffers,
            wantedSkills: userBWants,
          },
          matchPercentage: matchResult.matchPercentage,
          matchType: matchResult.matchType,
          canTeachYou: matchResult.canTeachYou,
          youCanTeach: matchResult.youCanTeach,
          breakdown: matchResult.breakdown,
        });
      }
    }

    // Sort by match percentage descending
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get match score between current user and a specific user
// @route   GET /api/matches/:userId
// @access  Private
const getMatchWithUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot match with yourself',
      });
    }

    const targetUser = await User.findById(targetUserId).select('-password');
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found or inactive',
      });
    }

    const mySkills = await Skill.find({ userId: currentUserId });
    const userAOffers = mySkills.filter((s) => s.skillType === 'Offer');
    const userAWants = mySkills.filter((s) => s.skillType === 'Want');

    const targetSkills = await Skill.find({ userId: targetUserId });
    const userBOffers = targetSkills.filter((s) => s.skillType === 'Offer');
    const userBWants = targetSkills.filter((s) => s.skillType === 'Want');

    const matchResult = calculateMatchScore({
      userAOffers,
      userAWants,
      userBOffers,
      userBWants,
      userBProfile: targetUser,
    });

    const reviews = await Review.find({ revieweeId: targetUser._id });
    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      match: matchResult
        ? {
            user: {
              ...targetUser.toObject(),
              averageRating: avgRating,
              reviewCount: reviews.length,
              offeredSkills: userBOffers,
              wantedSkills: userBWants,
            },
            ...matchResult,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches,
  getMatchWithUser,
};
