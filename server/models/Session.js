const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Swap',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a session title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please provide a scheduled date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide a start time (e.g. 10:00)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Please provide an end time (e.g. 11:00)'],
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ swapId: 1, scheduledDate: 1 });

module.exports = mongoose.model('Session', sessionSchema);
