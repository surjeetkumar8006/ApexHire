import Application from '../models/Application.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Student)
export const applyToJob = async (req, res) => {
  const { jobId } = req.body;

  try {
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get student profile
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile || !profile.resumeUrl) {
      return res
        .status(400)
        .json({ message: 'Please upload a resume in your profile before applying' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      resumeUrl: profile.resumeUrl,
      status: 'Applied',
    });

    // Notify admin (create notification for the admin who posted the job, if applicable)
    await Notification.create({
      recipient: job.postedBy,
      title: 'New Job Application',
      message: `${req.user.name} applied for the position of ${job.title} at ${job.company}.`,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (Admin view)
// @route   GET /api/applications/all
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('job')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Admin)
export const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status & add feedback
// @route   PUT /api/applications/:id
// @access  Private (Admin)
export const updateApplicationStatus = async (req, res) => {
  const { status, feedback } = req.body;

  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('student', 'name email');

    if (application) {
      application.status = status || application.status;
      if (feedback !== undefined) application.feedback = feedback;

      const updatedApplication = await application.save();

      // Create notification for the student
      await Notification.create({
        recipient: application.student._id,
        title: `Application Update: ${application.job.title}`,
        message: `Your application status for ${application.job.title} at ${application.job.company} has been updated to "${status}". Feedback: ${feedback || 'None'}`,
      });

      res.json(updatedApplication);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
