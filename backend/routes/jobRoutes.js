import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecommendedJobs,
} from '../controllers/jobController.js';
import { protect, adminOrRecruiter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getJobs).post(protect, adminOrRecruiter, createJob);

router.route('/recommendations').get(protect, getRecommendedJobs);

router
  .route('/:id')
  .get(getJobById)
  .put(protect, adminOrRecruiter, updateJob)
  .delete(protect, adminOrRecruiter, deleteJob);

export default router;
