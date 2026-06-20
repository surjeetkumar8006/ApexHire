import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getAllProfiles,
  getProfileByUserId,
  toggleVerification,
  updateSettings,
  getPublicProfile,
} from '../controllers/profileController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getStudentProfile)
  .put(protect, updateStudentProfile);

router.route('/settings').put(protect, updateSettings);

router.route('/public/:username').get(getPublicProfile); // Public route

router.route('/all').get(protect, admin, getAllProfiles);
router.route('/user/:id').get(protect, admin, getProfileByUserId);
router.route('/verify/:id').put(protect, admin, toggleVerification);

export default router;
