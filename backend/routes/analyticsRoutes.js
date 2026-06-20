import express from 'express';
import { getAdminAnalytics, getPublicStats } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicStats);
router.get('/admin', protect, admin, getAdminAnalytics);

export default router;
