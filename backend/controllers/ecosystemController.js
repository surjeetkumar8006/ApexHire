import ForumPost from '../models/ForumPost.js';
import Alumni from '../models/Alumni.js';
import ReferralRequest from '../models/ReferralRequest.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';

// ==========================================
// 1. DISCUSSION FORUM
// ==========================================

export const getForumPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({})
      .populate('user', 'name role avatar')
      .populate('comments.user', 'name role avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createForumPost = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await ForumPost.create({
      user: req.user._id,
      title,
      content,
      category: category || 'General',
      upvotes: [],
      comments: [],
    });

    const populatedPost = await ForumPost.findById(post._id).populate('user', 'name role avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const index = post.upvotes.indexOf(req.user._id);
    if (index === -1) {
      post.upvotes.push(req.user._id);
    } else {
      post.upvotes.splice(index, 1);
    }

    await post.save();
    res.json({ upvotes: post.upvotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('user', 'name role avatar')
      .populate('comments.user', 'name role avatar');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. ALUMNI DIRECTORY
// ==========================================

export const getAlumni = async (req, res) => {
  try {
    let alumni = await Alumni.find({}).sort({ name: 1 });
    if (alumni.length === 0) {
      // Seed some alumni if empty
      alumni = await Alumni.create([
        { name: 'Aarav Sharma', company: 'Google', role: 'Software Engineer II', batch: '2022', linkedin: 'https://linkedin.com', email: 'aarav@google.com' },
        { name: 'Priya Patel', company: 'Microsoft', role: 'Product Manager', batch: '2023', linkedin: 'https://linkedin.com', email: 'priya@microsoft.com' },
        { name: 'Rahul Varma', company: 'Amazon', role: 'SDE-2', batch: '2021', linkedin: 'https://linkedin.com', email: 'rahul@amazon.com' },
        { name: 'Neha Gupta', company: 'Meta', role: 'Frontend Engineer', batch: '2023', linkedin: 'https://linkedin.com', email: 'neha@meta.com' }
      ]);
    }
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAlumni = async (req, res) => {
  const { name, company, role, batch, linkedin, email } = req.body;

  try {
    const alumni = await Alumni.create({ name, company, role, batch, linkedin, email });
    res.status(201).json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. REFERRAL MARKETPLACE
// ==========================================

export const getReferralRequests = async (req, res) => {
  try {
    let query = {};
    // Students only see their own requests
    if (req.user.role === 'student') {
      query = { student: req.user._id };
    }

    const requests = await ReferralRequest.find(query)
      .populate('student', 'name email phone')
      .populate('job', 'title company location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReferralRequest = async (req, res) => {
  const { jobId, alumniName, alumniCompany, note } = req.body;

  try {
    if (!jobId || !alumniName || !alumniCompany) {
      return res.status(400).json({ message: 'Job, Alumni Name and Alumni Company are required fields' });
    }

    const request = await ReferralRequest.create({
      student: req.user._id,
      job: jobId,
      alumniName,
      alumniCompany,
      note,
      status: 'Pending',
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReferralStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    request.status = status;
    await request.save();

    // Notify the student
    await Notification.create({
      recipient: request.student,
      title: `Referral Request Update! 🚀`,
      message: `Your referral request to ${request.alumniName} at ${request.alumniCompany} has been updated to "${status}".`,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. REAL-TIME CHAT MESSAGING
// ==========================================

export const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    // Deduplicate to find unique partners
    const partnersMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender.toString() === userId.toString();
      const partnerId = isSender ? msg.receiver.toString() : msg.sender.toString();

      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          lastMessage: msg.text,
          timestamp: msg.createdAt,
        });
      }
    }

    // Populate partner details
    const inbox = [];
    for (const [partnerId, data] of partnersMap.entries()) {
      const partnerUser = await User.findById(partnerId).select('name email role avatar');
      if (partnerUser) {
        inbox.push({
          partner: partnerUser,
          lastMessage: data.lastMessage,
          timestamp: data.timestamp,
        });
      }
    }

    res.json(inbox);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  const { partnerId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: partnerId },
        { sender: partnerId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;

  try {
    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required fields' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersList = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { role: { $in: ['recruiter', 'admin'] } };
    } else {
      query = { _id: { $ne: req.user._id } };
    }
    const users = await User.find(query).select('name email role avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete alumni profile
// @route   DELETE /api/ecosystem/alumni/:id
// @access  Private (Admin only)
export const deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni record not found' });
    }
    await alumni.deleteOne();
    res.json({ message: 'Alumni record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
