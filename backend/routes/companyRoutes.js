import express from 'express';
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
} from '../controllers/companyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, admin, getCompanies)
  .post(protect, admin, createCompany);

router
  .route('/:id')
  .put(protect, admin, updateCompany)
  .delete(protect, admin, deleteCompany);

export default router;
