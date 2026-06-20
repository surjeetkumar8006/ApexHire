import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  getCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// Coordinator CRUD routes (Admin Only)
router.route('/coordinators')
  .get(protect, admin, getCoordinators)
  .post(protect, admin, createCoordinator);

router.route('/coordinators/:id')
  .put(protect, admin, updateCoordinator)
  .delete(protect, admin, deleteCoordinator);

export default router;
