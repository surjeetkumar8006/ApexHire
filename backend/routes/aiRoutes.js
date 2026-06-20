import express from 'express';
import {
  uploadResumeAndAnalyze,
  getCareerAdvice,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze-resume', protect, upload.single('resume'), uploadResumeAndAnalyze);
router.get('/career-advice', protect, getCareerAdvice);

export default router;
