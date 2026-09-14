import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getAdminEnrollments,
  updateEnrollmentStatus,
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/enroll', protect, enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/admin', protect, admin, getAdminEnrollments);
router.put('/admin/:id', protect, admin, updateEnrollmentStatus);

export default router;
