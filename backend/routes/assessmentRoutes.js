import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getLeaderboard,
  createAssessment,
  deleteAssessment,
} from '../controllers/assessmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAssessments)
  .post(protect, admin, createAssessment);

router.route('/leaderboard').get(protect, getLeaderboard);

router
  .route('/:id')
  .get(protect, getAssessmentById)
  .delete(protect, admin, deleteAssessment);

router.route('/:id/submit').post(protect, submitAssessment);

export default router;
