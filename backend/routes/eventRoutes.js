import express from 'express';
import {
  getEvents,
  createEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getEvents)
  .post(protect, admin, createEvent);

router
  .route('/:id')
  .delete(protect, admin, deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.post('/:id/unregister', protect, unregisterFromEvent);

export default router;
