import express from 'express';
import { getAdminAnalytics, getPublicStats, recordHeartbeat, getOnlineCount } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicStats);
router.get('/admin', protect, admin, getAdminAnalytics);
router.post('/heartbeat', recordHeartbeat);
router.get('/online-count', getOnlineCount);

export default router;
