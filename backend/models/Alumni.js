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
  },
  {
    timestamps: true,
  }
);

const Alumni = mongoose.model('Alumni', alumniSchema);
export default Alumni;
