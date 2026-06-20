import express from 'express';
import { getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getAdminAnalytics);

export default router;
