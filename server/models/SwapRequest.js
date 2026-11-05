const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offeredSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Please select the skill you are offering'],
    },
    requestedSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Please select the skill you want from the user'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to check existing active/pending requests
swapRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
