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
  const { status, feedback, offerLetterUrl } = req.body;

  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('student', 'name email');

    if (application) {
      application.status = status || application.status;
      if (feedback !== undefined) application.feedback = feedback;
      if (offerLetterUrl !== undefined) application.offerLetterUrl = offerLetterUrl;

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

// @desc    Respond to offer (Accept / Reject)
// @route   PUT /api/applications/:id/offer
// @access  Private (Student)
export const respondToOffer = async (req, res) => {
  const { offerStatus } = req.body; // 'Accepted' or 'Rejected'

  try {
    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify it is indeed the logged-in student's application
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to respond to this offer' });
    }

    if (application.status !== 'Offered') {
      return res.status(400).json({ message: 'No offer has been extended for this application' });
    }

    application.offerStatus = offerStatus;
    const updatedApplication = await application.save();

    // Create notification for the admin who posted the job
    await Notification.create({
      recipient: application.job.postedBy,
      title: `Offer Status Update: ${application.job.title}`,
      message: `${req.user.name} has ${offerStatus.toLowerCase()} the job offer for the position of ${application.job.title}.`,
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
