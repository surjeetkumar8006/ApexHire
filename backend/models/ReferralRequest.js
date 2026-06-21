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
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const ReferralRequest = mongoose.model('ReferralRequest', referralRequestSchema);
export default ReferralRequest;
