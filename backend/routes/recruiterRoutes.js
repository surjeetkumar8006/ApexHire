import express from 'express';
import {
  getRecruiterJobs,
  getRecruiterApplicants,
  updateApplicationStatus,
  scheduleRecruiterInterview,
  getRecruiterAnalytics,
  searchResumes,
} from '../controllers/recruiterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Role validation middleware for recruiters
const recruiterOnly = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Recruiter permissions required.' });
  }
};

router.use(protect);
router.use(recruiterOnly);

router.get('/jobs', getRecruiterJobs);
router.get('/applicants', getRecruiterApplicants);
router.put('/applications/:id', updateApplicationStatus);
router.post('/interviews', scheduleRecruiterInterview);
router.get('/analytics', getRecruiterAnalytics);
router.get('/resumes', searchResumes);

export default router;
