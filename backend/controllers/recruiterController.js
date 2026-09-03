import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Profile from '../models/Profile.js';
import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get all jobs posted by the logged-in recruiter
// @route   GET /api/recruiter/jobs
// @access  Private (Recruiter)
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for the recruiter's jobs
// @route   GET /api/recruiter/applicants
// @access  Private (Recruiter)
export const getRecruiterApplicants = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('student', 'name email phone avatar')
      .populate('job', 'title company location type')
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
  const { status, feedback } = req.body;

  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) application.status = status;
    if (feedback !== undefined) application.feedback = feedback;

    await application.save();

    // Increment candidate profileViews when status is updated by recruiter
    if (application.student?._id) {
      await Profile.findOneAndUpdate(
        { user: application.student._id },
        { $inc: { profileViews: 1 } }
      );
    }

    // Notify student about stage updates
    await Notification.create({
      recipient: application.student._id,
      title: `Application Update: ${application.job.title} 💼`,
      message: `Your application status for "${application.job.title}" at "${application.job.company}" has been updated to "${status}".`,
    });

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Schedule interview and auto-generate meeting links
// @route   POST /api/recruiter/interviews
// @access  Private (Recruiter)
export const scheduleRecruiterInterview = async (req, res) => {
  const { studentId, jobTitle, company, date, time, type } = req.body;

  try {
    if (!studentId || !jobTitle || !company || !date || !time) {
      return res.status(400).json({ message: 'Please specify student, job, company, date, and time.' });
    }

    // Auto-generate a meeting link (Google Meet / Zoom mock)
    const prefixes = ['meet.google.com/abc-defg-hij', 'meet.google.com/xyz-qwer-tyu', 'zoom.us/j/5558889999'];
    const link = `https://${prefixes[Math.floor(Math.random() * prefixes.length)]}`;

    const interview = await Interview.create({
      student: studentId,
      company,
      role: jobTitle,
      date,
      time,
      type: type || 'Technical Round',
      status: 'Scheduled',
      link,
    });

    // Increment profileViews for interview candidate
    await Profile.findOneAndUpdate(
      { user: studentId },
      { $inc: { profileViews: 1 } }
    );

    // Notify student
    await Notification.create({
      recipient: studentId,
      title: 'Interview scheduled! 🗓',
      message: `Your interview for "${jobTitle}" at "${company}" is scheduled on ${date} @ ${time}. Join link: ${link}`,
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
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } });

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
