import express from 'express';
import {
  getForumPosts,
  createForumPost,
  toggleUpvote,
  addComment,
  getAlumni,
  createAlumni,
  deleteAlumni,
  getReferralRequests,
  createReferralRequest,
  updateReferralStatus,
  getInbox,
  getChatHistory,
  sendMessage,
  getUsersList,
} from '../controllers/ecosystemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Forums
router.get('/forum', getForumPosts);
router.post('/forum', createForumPost);
router.post('/forum/:id/upvote', toggleUpvote);
router.post('/forum/:id/comment', addComment);

// Alumni Directory
router.get('/alumni', getAlumni);
router.post('/alumni', createAlumni);
router.delete('/alumni/:id', admin, deleteAlumni);

// Referral Marketplace
router.get('/referrals', getReferralRequests);
router.post('/referrals', createReferralRequest);
router.put('/referrals/:id', updateReferralStatus);

// Real-time Chat
router.get('/chat/inbox', getInbox);
router.get('/chat/:partnerId', getChatHistory);
router.post('/chat', sendMessage);
router.get('/users', getUsersList);

export default router;
