import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'Technical Round 1',
    },
    status: {
      type: String,
      enum: ['Requested', 'Scheduled', 'Completed'],
      default: 'Scheduled',
    },
    link: {
      type: String,
      default: '',
    },
    studentFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: { type: String, default: '' },
      felt: { type: String, enum: ['Excellent', 'Good', 'Average', 'Poor'], default: 'Good' }
    }
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
