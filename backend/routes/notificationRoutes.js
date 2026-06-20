import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createBroadcastAnnouncement,
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/read-all').put(protect, markAllAsRead);
router.route('/broadcast').post(protect, admin, createBroadcastAnnouncement);
router.route('/:id').put(protect, markAsRead);

export default router;
