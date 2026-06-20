import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Applied',
    },
    feedback: {
      type: String,
      default: '',
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
    offerStatus: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only apply once to a specific job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
