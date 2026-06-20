import express from 'express';
import {
  getInterviews,
  getStudentInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getInterviews).post(protect, admin, createInterview);
router.route('/my').get(protect, getStudentInterviews);
router
  .route('/:id')
  .put(protect, admin, updateInterview)
  .delete(protect, admin, deleteInterview);

export default router;
