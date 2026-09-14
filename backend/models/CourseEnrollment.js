import mongoose from 'mongoose';

const courseEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Online Live',
    },
    duration: {
      type: String,
      default: '6 Months',
    },
    selectedPlan: {
      type: String,
      default: 'No-Cost EMI (6 Months)',
    },
    monthlyEmi: {
      type: String,
      default: '₹3,999/month',
    },
    totalFee: {
      type: String,
      default: '₹23,999',
    },
    scholarshipApplied: {
      type: Boolean,
      default: false,
    },
    scholarshipDiscount: {
      type: String,
      default: '0%',
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Active', 'Completed', 'Cancelled'],
      default: 'Enrolled',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

export default CourseEnrollment;
