import Interview from '../models/Interview.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all interviews (Admin view, with auto-seeding if empty)
// @route   GET /api/interviews
// @access  Private (Admin)
export const getInterviews = async (req, res) => {
  try {
    const count = await Interview.countDocuments({});
    if (count === 0) {
      // Find a student user to associate seeded interviews with
      const student = await User.findOne({ role: 'student' });
      if (student) {
        await Interview.create([
          {
            student: student._id,
            company: 'Google',
            role: 'Frontend Engineer',
            date: '2026-06-30',
            time: '10:00 AM',
            type: 'Technical Round 1',
            status: 'Scheduled',
            link: 'https://zoom.us/j/123456789',
          },
          {
            student: student._id,
            company: 'Amazon',
            role: 'Backend SDE',
            date: '2026-07-02',
            time: '02:30 PM',
            type: 'HR Round',
            status: 'Requested',
            link: '',
          },
          {
            student: student._id,
            company: 'Microsoft',
            role: 'Full Stack Developer',
            date: '2026-06-18',
            time: '11:00 AM',
            type: 'System Design',
            status: 'Completed',
            link: 'https://zoom.us/j/987654321',
          },
        ]);
      }
    }

    const interviews = await Interview.find({}).populate('student', 'name email').sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student interviews
// @route   GET /api/interviews/my
// @access  Private (Student)
export const getStudentInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ student: req.user._id }).sort({ date: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new interview schedule
// @route   POST /api/interviews
// @access  Private (Admin)
export const createInterview = async (req, res) => {
  const { studentId, company, role, date, time, type, link, status } = req.body;

  try {
    if (!studentId || !company || !role || !date || !time) {
      return res.status(400).json({ message: 'Please provide student, company, role, date, and time fields.' });
    }

    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const interview = await Interview.create({
      student: studentId,
      company,
      role,
      date,
      time,
      type,
      link,
      status: status || 'Scheduled',
    });

    // Create student notification
    await Notification.create({
      recipient: studentId,
      title: 'New Interview Scheduled! 🗓',
      message: `A new interview for "${role}" at ${company} has been scheduled on ${date} at ${time}.`,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an interview status/details
// @route   PUT /api/interviews/:id
// @access  Private (Admin)
export const updateInterview = async (req, res) => {
  const { company, role, date, time, type, status, link, studentFeedback } = req.body;

  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Authorization check: only admin, recruiter, or the student candidate can update this interview
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'recruiter' &&
      interview.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to modify this interview' });
    }

    if (company) interview.company = company;
    if (role) interview.role = role;
    if (date) interview.date = date;
    if (time) interview.time = time;
    if (type) interview.type = type;
    if (status) interview.status = status;
    if (link !== undefined) interview.link = link;
    if (studentFeedback) interview.studentFeedback = studentFeedback;

    const updatedInterview = await interview.save();

    // Notify the student
    await Notification.create({
      recipient: interview.student,
      title: 'Interview Details Updated 🔔',
      message: `Your interview for "${interview.role}" at ${interview.company} has been updated to "${interview.status}". Time: ${interview.date} @ ${interview.time}.`,
    });

    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Private (Admin)
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (interview) {
      const studentId = interview.student;
      const role = interview.role;
      const company = interview.company;

      await interview.deleteOne();

      // Notify the student
      await Notification.create({
        recipient: studentId,
        title: 'Interview Cancelled ❌',
        message: `Your scheduled interview for "${role}" at ${company} has been cancelled.`,
      });

      res.json({ message: 'Interview removed successfully' });
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
