import CourseEnrollment from '../models/CourseEnrollment.js';
import Notification from '../models/Notification.js';

// @desc    Enroll student in a Tech Course
// @route   POST /api/courses/enroll
// @access  Private (Student)
export const enrollInCourse = async (req, res) => {
  try {
    const {
      courseId,
      courseTitle,
      category,
      duration,
      selectedPlan,
      monthlyEmi,
      totalFee,
      scholarshipApplied,
      scholarshipDiscount,
    } = req.body;

    if (!courseId || !courseTitle) {
      return res.status(400).json({ message: 'Course ID and Title are required' });
    }

    // Check if student already enrolled in this course
    let existing = await CourseEnrollment.findOne({
      student: req.user._id,
      courseId,
    });

    if (existing) {
      existing.selectedPlan = selectedPlan || existing.selectedPlan;
      existing.monthlyEmi = monthlyEmi || existing.monthlyEmi;
      existing.totalFee = totalFee || existing.totalFee;
      existing.scholarshipApplied = scholarshipApplied ?? existing.scholarshipApplied;
      existing.scholarshipDiscount = scholarshipDiscount || existing.scholarshipDiscount;
      existing.status = 'Enrolled';
      await existing.save();

      // Create notification
      await Notification.create({
        recipient: req.user._id,
        title: 'Course Plan Updated! 🎓',
        message: `Your enrollment for "${courseTitle}" has been updated with plan: ${selectedPlan || 'Selected Plan'}.`,
        type: 'SYSTEM',
      });

      return res.status(200).json({
        message: `Enrollment updated for ${courseTitle}!`,
        enrollment: existing,
      });
    }

    // Create new enrollment
    const enrollment = await CourseEnrollment.create({
      student: req.user._id,
      courseId,
      courseTitle,
      category: category || 'Online Live',
      duration: duration || '6 Months',
      selectedPlan: selectedPlan || 'No-Cost EMI (6 Months)',
      monthlyEmi: monthlyEmi || '₹3,999/month',
      totalFee: totalFee || '₹23,999',
      scholarshipApplied: !!scholarshipApplied,
      scholarshipDiscount: scholarshipDiscount || '0%',
      status: 'Enrolled',
    });

    // Send real-time notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Course Enrollment Confirmed! 🎉',
      message: `Congratulations! You are officially enrolled in "${courseTitle}" under the ${selectedPlan || 'Selected EMI Plan'}. Check your student dashboard for access link & curriculum!`,
      type: 'SYSTEM',
    });

    res.status(201).json({
      message: `Successfully enrolled in ${courseTitle}! 🎉`,
      enrollment,
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

// @desc    Get logged in student's course enrollments
// @route   GET /api/courses/my
// @access  Private (Student)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({ message: 'Server error fetching enrollments' });
  }
};

// @desc    Get all course enrollments for Admin history
// @route   GET /api/courses/admin
// @access  Private (Admin)
export const getAdminEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find()
      .populate('student', 'name email phone avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching admin enrollments:', error);
    res.status(500).json({ message: 'Server error fetching admin enrollments' });
  }
};

// @desc    Admin update enrollment status
// @route   PUT /api/courses/admin/:id
// @access  Private (Admin)
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enrollment = await CourseEnrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    if (status) enrollment.status = status;
    await enrollment.save();

    // Send notification to student
    await Notification.create({
      recipient: enrollment.student,
      title: 'Course Status Update 🎓',
      message: `Your status for "${enrollment.courseTitle}" has been updated to "${status}".`,
      type: 'SYSTEM',
    });

    res.status(200).json({ message: 'Enrollment status updated', enrollment });
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    res.status(500).json({ message: 'Server error updating enrollment status' });
  }
};
