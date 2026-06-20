import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    activeJobs: {
      type: Number,
      default: 0,
    },
    totalHires: {
      type: Number,
      default: 0,
    },
    logoColor: {
      type: String,
      default: () => {
        const colors = ['#4285F4', '#FF9900', '#00A4EF', '#34A853', '#EA4335', '#9C27B0', '#3F51B5', '#009688', '#FF5722', '#795548'];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;
