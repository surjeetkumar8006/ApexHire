import mongoose from 'mongoose';

const referralRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: false,
    },
    jobTitle: {
      type: String,
      default: '',
    },
    alumniName: {
      type: String,
      required: true,
      trim: true,
    },
    alumniCompany: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    note: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    responseNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ReferralRequest = mongoose.model('ReferralRequest', referralRequestSchema);
export default ReferralRequest;
