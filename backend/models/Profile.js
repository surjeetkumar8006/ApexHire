import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String },
        startYear: { type: String },
        endYear: { type: String },
        cgpa: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        duration: { type: String },
        description: { type: String },
      },
    ],
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeParsedText: {
      type: String,
      default: '',
    },
    aiFeedback: {
      score: { type: Number, default: 0 },
      suggestions: { type: [String], default: [] },
      matchedRoles: { type: [String], default: [] },
    },
    portfolioLinks: [
      {
        platform: { type: String }, // e.g. 'github', 'linkedin', 'portfolio'
        url: { type: String }
      }
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        technologies: { type: [String] },
        link: { type: String }
      }
    ],
    achievements: {
      type: [String],
      default: []
    },
    activityDays: {
      type: Number,
      default: 0
    },
    profileViews: {
      type: Number,
      default: 0
    },
    problemSolving: {
      total: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    resumeStatus: {
      type: String,
      enum: ['verified', 'pending', 'missing'],
      default: 'missing'
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'verified', 'private'],
        default: 'verified'
      }
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
