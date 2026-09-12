import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Profile from '../models/Profile.js';
import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get all jobs in portal (both Admin & Recruiter created)
// @route   GET /api/recruiter/jobs
// @access  Private (Recruiter)
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for portal jobs
// @route   GET /api/recruiter/applicants
// @access  Private (Recruiter)
export const getRecruiterApplicants = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('student', 'name email phone avatar')
      .populate({
        path: 'job',
        select: 'title company location type salary postedBy status',
        populate: {
          path: 'postedBy',
          select: 'name email role'
        }
      })
      .sort({ createdAt: -1 });

    // Auto-increment Profile Views for candidates viewed by recruiter
    const studentUserIds = [...new Set(applications.map(app => app.student?._id).filter(Boolean))];
    if (studentUserIds.length > 0) {
      await Profile.updateMany(
        { user: { $in: studentUserIds } },
        { $inc: { profileViews: 1 } }
      );
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status in pipeline
// @route   PUT /api/recruiter/applications/:id
// @access  Private (Recruiter)
export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Create a notification for the student
    await Notification.create({
      recipient: application.student,
      sender: req.user._id,
      type: 'STATUS_UPDATE',
      title: 'Application Status Updated',
      message: `Your application status for job ID ${application.job} has been updated to "${status}".`,
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Schedule interview for candidate
// @route   POST /api/recruiter/interviews
// @access  Private (Recruiter)
export const scheduleInterview = async (req, res) => {
  const { studentId, jobTitle, company, date, time, type } = req.body;
  try {
    const interview = await Interview.create({
      student: studentId,
      recruiter: req.user._id,
      jobTitle,
      company,
      date,
      time,
      type,
      status: 'Scheduled',
      meetingLink: `https://meet.google.com/apex-${Math.random().toString(36).substring(2, 7)}`
    });

    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `An interview for ${jobTitle} at ${company} has been scheduled on ${date} at ${time}. Link: ${interview.meetingLink}`,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get hiring funnel analytics for recruiter
// @route   GET /api/recruiter/analytics
// @access  Private (Recruiter)
export const getRecruiterAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({});
    const applications = await Application.find({});

    // Funnel counts
    const counts = {
      totalJobs: jobs.length,
      totalApplicants: applications.length,
      applied: applications.filter(a => a.status === 'Applied').length,
      underReview: applications.filter(a => a.status === 'Under Review' || a.status === 'Reviewing').length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      interviewScheduled: applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interviewing').length,
      selected: applications.filter(a => a.status === 'Selected').length,
      offerSent: applications.filter(a => a.status === 'Offer Sent' || a.status === 'Offered').length,
      joined: applications.filter(a => a.status === 'Joined').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search Student Resume Database
// @route   GET /api/recruiter/resumes
// @access  Private (Recruiter)
export const searchResumes = async (req, res) => {
  const { skill } = req.query;

  try {
    let query = {};
    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    const profiles = await Profile.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ updatedAt: -1 });

    // Auto-increment Profile Views for candidates surfaced in search
    const profileIds = profiles.map(p => p._id);
    if (profileIds.length > 0) {
      await Profile.updateMany(
        { _id: { $in: profileIds } },
        { $inc: { profileViews: 1 } }
      );
    }

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
