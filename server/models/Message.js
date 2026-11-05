const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Swap',
      required: true,
      index: true,
    },
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
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ swapId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
