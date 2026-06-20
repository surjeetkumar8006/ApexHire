import express from 'express';
import { getPlatformConfig, updatePlatformConfig } from '../controllers/platformConfigController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getPlatformConfig)
  .put(protect, admin, updatePlatformConfig);

export default router;
