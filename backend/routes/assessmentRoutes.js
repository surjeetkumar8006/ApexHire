import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getLeaderboard,
} from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAssessments);
router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/:id').get(protect, getAssessmentById);
router.route('/:id/submit').post(protect, submitAssessment);

export default router;
