import mongoose from 'mongoose';

const platformConfigSchema = new mongoose.Schema(
  {
    driveName: {
      type: String,
      required: true,
      default: 'ApexHire Drive 2026',
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-27',
    },
    minCgpa: {
      type: Number,
      required: true,
      default: 6.5,
    },
    allowedBranches: {
      type: String,
      required: true,
      default: 'CSE, ECE, EEE, ME',
    },
    coordinatorEmail: {
      type: String,
      required: true,
      default: 'coordinator@accio.com',
    },
    autoVerify: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);

export default PlatformConfig;
