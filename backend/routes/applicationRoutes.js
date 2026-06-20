import express from 'express';
import {
  applyToJob,
  getStudentApplications,
  getAllApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, applyToJob);
router.route('/my').get(protect, getStudentApplications);
router.route('/all').get(protect, admin, getAllApplications);
router.route('/job/:jobId').get(protect, admin, getJobApplications);
router.route('/:id').put(protect, admin, updateApplicationStatus);

export default router;
