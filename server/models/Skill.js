const mongoose = require('mongoose');

const skillCategories = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Communication',
  'Languages',
  'Business',
  'Finance',
  'Music',
  'Photography',
  'Other',
];

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Skill must belong to a user'],
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'Please provide a skill name'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: skillCategories,
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    skillType: {
      type: String,
      required: [true, 'Please specify if this is an Offer or Want'],
      enum: ['Offer', 'Want'],
      index: true,
    },
    proficiencyLevel: {
      type: String,
      required: [true, 'Please select proficiency level'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
skillSchema.index({ skillName: 'text', description: 'text' });
// Compound index for matching queries
skillSchema.index({ skillType: 1, category: 1, skillName: 1 });

module.exports = mongoose.model('Skill', skillSchema);
module.exports.SKILL_CATEGORIES = skillCategories;
