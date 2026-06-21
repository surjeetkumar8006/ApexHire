import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    feedback: [
      {
        question: { type: String },
        answer: { type: String },
        score: { type: Number },
        tips: { type: String },
        modelAnswer: { type: String },
      }
    ],
    expertFeedback: {
      rating: { type: Number },
      comments: { type: String },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

export default MockInterview;
