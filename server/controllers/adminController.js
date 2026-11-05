const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Swap = require('../models/Swap');
const Review = require('../models/Review');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

// @desc    Get Admin Dashboard Overview Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isActive: false });

    const totalSkills = await Skill.countDocuments();
    const offeredSkills = await Skill.countDocuments({ skillType: 'Offer' });
    const wantedSkills = await Skill.countDocuments({ skillType: 'Want' });

    const totalRequests = await SwapRequest.countDocuments();
    const pendingRequests = await SwapRequest.countDocuments({ status: 'Pending' });

    const totalSwaps = await Swap.countDocuments();
    const activeSwaps = await Swap.countDocuments({ status: 'Active' });
    const completedSwaps = await Swap.countDocuments({ status: 'Completed' });

    const totalReviews = await Review.countDocuments();
    const totalSessions = await Session.countDocuments();

    // Average platform rating
    const allReviews = await Review.find().select('rating');
    const averageRating =
      allReviews.length > 0
        ? Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1))
        : 0;

    // Recent registered users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent swaps
    const recentSwaps = await Swap.find()
      .populate('participants', 'name email profilePicture')
      .populate('offeredSkill', 'skillName category')
      .populate('requestedSkill', 'skillName category')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        skills: {
          total: totalSkills,
          offered: offeredSkills,
          wanted: wantedSkills,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
        },
        swaps: {
          total: totalSwaps,
          active: activeSwaps,
          completed: completedSwaps,
        },
        sessions: {
          total: totalSessions,
        },
        reviews: {
          total: totalReviews,
          averageRating,
        },
        recentUsers,
        recentSwaps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { search, role, status } = req.query;

    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.isActive = status === 'Active';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Attach skill and swap counts to each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const skillsCount = await Skill.countDocuments({ userId: u._id });
        const swapsCount = await Swap.countDocuments({ participants: u._id });
        return {
          ...u.toObject(),
          skillsCount,
          swapsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or Reactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
    await user.save();

    // Notify user if suspended or reactivated
    await Notification.create({
      userId: user._id,
      type: 'SYSTEM',
      title: user.isActive ? 'Account Reactivated' : 'Account Suspended',
      message: user.isActive
        ? 'Your SkillSwap account has been reactivated by the administrator.'
        : 'Your SkillSwap account has been temporarily suspended by the administrator.',
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'reactivated' : 'suspended'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all skills for Admin
// @route   GET /api/admin/skills
// @access  Private/Admin
const getAllSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { search, category, skillType } = req.query;

    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { skillName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (skillType && skillType !== 'All') {
      query.skillType = skillType;
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('userId', 'name email profilePicture isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an inappropriate skill listing by Admin
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
const deleteSkillByAdmin = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill listing not found',
      });
    }

    // Notify the user about moderation
    await Notification.create({
      userId: skill.userId,
      type: 'SYSTEM',
      title: 'Skill Listing Removed by Moderator',
      message: `Your listing for "${skill.skillName}" was removed by platform moderation for violating community guidelines.`,
    });

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Skill listing successfully removed by administrator',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllSkills,
  deleteSkillByAdmin,
};
