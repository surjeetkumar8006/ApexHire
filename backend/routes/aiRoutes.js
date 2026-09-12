import express from 'express';
import {
  uploadResumeAndAnalyze,
  getCareerAdvice,
  matchJobAndResume,
  coachChat,
  generateRoadmap,
  generateInterview,
  evaluateInterview,
  getMockInterviews,
  getAllMockInterviews,
  addExpertFeedback,
  tailorResume,
  analyzeCode,
  generateSkillRoadmap,
  negotiateOffer,
  getCandidateLeaderboard,
} from '../controllers/aiController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze-resume', protect, upload.single('resume'), uploadResumeAndAnalyze);
router.get('/career-advice', protect, getCareerAdvice);
router.post('/match-job', protect, matchJobAndResume);
router.post('/coach-chat', protect, coachChat);
router.post('/generate-roadmap', protect, generateRoadmap);
router.post('/generate-interview', protect, generateInterview);
router.post('/evaluate-interview', protect, evaluateInterview);
router.get('/mock-interviews', protect, getMockInterviews);
router.get('/mock-interviews/all', protect, admin, getAllMockInterviews);
router.put('/mock-interviews/:id/expert-feedback', protect, admin, addExpertFeedback);

// 5 New Real-Time Working AI Endpoints
router.post('/tailor-resume', protect, tailorResume);
router.post('/analyze-code', protect, analyzeCode);
router.post('/skill-roadmap', protect, generateSkillRoadmap);
router.post('/negotiate-offer', protect, negotiateOffer);
router.get('/candidate-leaderboard', protect, getCandidateLeaderboard);

export default router;
