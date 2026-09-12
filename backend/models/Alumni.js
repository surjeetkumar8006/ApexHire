import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    batch: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    domain: {
      type: String,
      default: 'Software Engineering',
    },
    skills: {
      type: [String],
      default: [],
    },
    availableForReferrals: {
      type: Boolean,
      default: true,
    },
    availableForMentorship: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Alumni = mongoose.model('Alumni', alumniSchema);
export default Alumni;
