const Skill = require('../models/Skill');
const { SKILL_CATEGORIES } = require('../models/Skill');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Create a new skill (Offer or Want)
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const { skillName, category, skillType, proficiencyLevel, description } = req.body;

    if (!skillName || !category || !skillType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skill name, category, and skill type (Offer or Want)',
      });
    }

    if (!SKILL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${SKILL_CATEGORIES.join(', ')}`,
      });
    }

    if (!['Offer', 'Want'].includes(skillType)) {
      return res.status(400).json({
        success: false,
        message: 'Skill type must be either "Offer" or "Want"',
      });
    }

    const skill = await Skill.create({
      userId: req.user.id,
      skillName: skillName.trim(),
      category,
      skillType,
      proficiencyLevel: proficiencyLevel || 'Intermediate',
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all skills with search, filter, sort & pagination
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const { search, category, proficiencyLevel, skillType, userId, sort } = req.query;

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

    if (proficiencyLevel && proficiencyLevel !== 'All') {
      query.proficiencyLevel = proficiencyLevel;
    }

    if (skillType && skillType !== 'All') {
      query.skillType = skillType;
    }

    if (userId) {
      query.userId = userId;
    }

    // Sort order
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name_asc') {
      sortOption = { skillName: 1 };
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('userId', 'name email profilePicture bio location isActive')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Filter out skills whose users are inactive/suspended
    const activeSkills = skills.filter((s) => s.userId && s.userId.isActive);

    // Attach user rating and other skills to each card
    const skillsWithUserDetails = await Promise.all(
      activeSkills.map(async (s) => {
        const u = s.userId;
        const reviews = await Review.find({ revieweeId: u._id });
        const avgRating =
          reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 0;

        const otherSkills = await Skill.find({ userId: u._id });
        const userOffers = otherSkills.filter((sk) => sk.skillType === 'Offer');
        const userWants = otherSkills.filter((sk) => sk.skillType === 'Want');

        return {
          ...s.toObject(),
          user: {
            ...u.toObject(),
            averageRating: avgRating,
            reviewCount: reviews.length,
            offeredSkills: userOffers,
            wantedSkills: userWants,
          },
        };
      })
    );

    // If sorting by rating
    if (sort === 'highest_rated') {
      skillsWithUserDetails.sort((a, b) => b.user.averageRating - a.user.averageRating);
    }

    res.status(200).json({
      success: true,
      count: skillsWithUserDetails.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      skills: skillsWithUserDetails,
      categories: SKILL_CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single skill by ID
// @route   GET /api/skills/:id
// @access  Public
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate(
      'userId',
      'name email profilePicture bio location isActive'
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    // Fetch user profile stats
    const reviews = await Review.find({ revieweeId: skill.userId._id })
      .populate('reviewerId', 'name profilePicture')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    const userAllSkills = await Skill.find({ userId: skill.userId._id });

    res.status(200).json({
      success: true,
      skill: {
        ...skill.toObject(),
        user: {
          ...skill.userId.toObject(),
          averageRating: avgRating,
          reviewCount: reviews.length,
          reviews,
          offeredSkills: userAllSkills.filter((s) => s.skillType === 'Offer'),
          wantedSkills: userAllSkills.filter((s) => s.skillType === 'Want'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's skills (both Offer and Want)
// @route   GET /api/skills/my-skills
// @access  Private
const getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const offeredSkills = skills.filter((s) => s.skillType === 'Offer');
    const wantedSkills = skills.filter((s) => s.skillType === 'Want');

    res.status(200).json({
      success: true,
      count: skills.length,
      offeredSkills,
      wantedSkills,
      allSkills: skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    // Ownership check
    if (skill.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this skill',
      });
    }

    const { skillName, category, skillType, proficiencyLevel, description } = req.body;

    if (category && !SKILL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    if (skillType && !['Offer', 'Want'].includes(skillType)) {
      return res.status(400).json({
        success: false,
        message: 'Skill type must be Offer or Want',
      });
    }

    if (skillName) skill.skillName = skillName.trim();
    if (category) skill.category = category;
    if (skillType) skill.skillType = skillType;
    if (proficiencyLevel) skill.proficiencyLevel = proficiencyLevel;
    if (description !== undefined) skill.description = description.trim();

    const updatedSkill = await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      skill: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    // Ownership check
    if (skill.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this skill',
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSkill,
  getSkills,
  getSkillById,
  getMySkills,
  updateSkill,
  deleteSkill,
};
