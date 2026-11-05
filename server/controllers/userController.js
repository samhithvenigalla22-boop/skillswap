const User = require('../models/User');
const Skill = require('../models/Skill');
const Review = require('../models/Review');

// @desc    Get all active users with search & filters
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { interests: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude current user if logged in
    if (req.user) {
      query._id = { $ne: req.user.id };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Attach skills and average ratings to users
    const usersWithDetails = await Promise.all(
      users.map(async (u) => {
        const skills = await Skill.find({ userId: u._id });
        const offeredSkills = skills.filter((s) => s.skillType === 'Offer');
        const wantedSkills = skills.filter((s) => s.skillType === 'Want');

        const reviews = await Review.find({ revieweeId: u._id });
        const avgRating =
          reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 0;

        return {
          ...u.toObject(),
          offeredSkills,
          wantedSkills,
          averageRating: avgRating,
          reviewCount: reviews.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: usersWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID with skills & reviews
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch user's skills
    const skills = await Skill.find({ userId: user._id });
    const offeredSkills = skills.filter((s) => s.skillType === 'Offer');
    const wantedSkills = skills.filter((s) => s.skillType === 'Want');

    // Fetch reviews received
    const reviews = await Review.find({ revieweeId: user._id })
      .populate('reviewerId', 'name profilePicture')
      .populate('swapId', 'status startedAt completedAt')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        offeredSkills,
        wantedSkills,
        reviews,
        averageRating: avgRating,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, bio, location, interests, profilePicture } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : [];
    }
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        location: updatedUser.location,
        interests: updatedUser.interests,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword,
};
