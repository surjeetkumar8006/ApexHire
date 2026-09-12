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
    if (alumni.length < 5) {
      // Clear legacy & re-seed comprehensive alumni profiles
      await Alumni.deleteMany({});
      alumni = await Alumni.create([
        {
          name: 'Aarav Sharma',
          company: 'Google',
          role: 'Software Engineer II (L4)',
          batch: '2022',
          domain: 'Software Engineering',
          skills: ['Distributed Systems', 'Go', 'Kubernetes', 'Java'],
          linkedin: 'https://linkedin.com/in/aarav-sharma',
          email: 'aarav.sharma@google.com',
          location: 'Bengaluru, India',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Passionate about cloud architecture & backend scale. Happy to refer top talent to Google Cloud & Core Systems teams.',
        },
        {
          name: 'Priya Patel',
          company: 'Microsoft',
          role: 'Senior Product Manager',
          batch: '2021',
          domain: 'Product Management',
          skills: ['Product Strategy', 'System Design', 'User Research', 'Agile'],
          linkedin: 'https://linkedin.com/in/priya-patel',
          email: 'priya.patel@microsoft.com',
          location: 'Hyderabad, India',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Leading Teams & Copilot ecosystem features at MSFT. Willing to guide and refer product thinkers.',
        },
        {
          name: 'Rahul Varma',
          company: 'Amazon',
          role: 'SDE-2 (AWS Infra)',
          batch: '2020',
          domain: 'DevOps & Cloud',
          skills: ['AWS', 'Java', 'DynamoDB', 'Microservices'],
          linkedin: 'https://linkedin.com/in/rahul-varma',
          email: 'rahul.varma@amazon.com',
          location: 'Bengaluru, India',
          availableForReferrals: true,
          availableForMentorship: false,
          bio: 'Building low-latency storage services for AWS S3. Reach out with strong DSA background for AWS referrals.',
        },
        {
          name: 'Neha Gupta',
          company: 'Meta',
          role: 'Staff Frontend Engineer',
          batch: '2021',
          domain: 'Software Engineering',
          skills: ['React', 'TypeScript', 'GraphQL', 'Web Performance'],
          linkedin: 'https://linkedin.com/in/neha-gupta',
          email: 'neha.gupta@meta.com',
          location: 'London, UK',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Building UI frameworks for Instagram Web. Looking for solid JS/TS candidates for Meta referrals.',
        },
        {
          name: 'Karan Mehta',
          company: 'Uber',
          role: 'Senior Data Scientist',
          batch: '2022',
          domain: 'AI / Machine Learning',
          skills: ['Python', 'PyTorch', 'SQL', 'Deep Learning'],
          linkedin: 'https://linkedin.com/in/karan-mehta',
          email: 'karan.mehta@uber.com',
          location: 'Bengaluru, India',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Specializing in Marketplace Pricing algorithms & ML pipelines at Uber. Open for ML engineering referrals.',
        },
        {
          name: 'Ananya Roy',
          company: 'Atlassian',
          role: 'Backend Engineer',
          batch: '2023',
          domain: 'Software Engineering',
          skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
          linkedin: 'https://linkedin.com/in/ananya-roy',
          email: 'ananya.roy@atlassian.com',
          location: 'Remote, India',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Jira Platform dev. Active mentor for campus hires and referral provider for Atlassian India.',
        },
        {
          name: 'Siddharth Nair',
          company: 'Swiggy',
          role: 'Engineering Manager',
          batch: '2019',
          domain: 'Software Engineering',
          skills: ['System Design', 'Go', 'Team Leadership', 'Kafka'],
          linkedin: 'https://linkedin.com/in/siddharth-nair',
          email: 'siddharth.nair@swiggy.in',
          location: 'Bengaluru, India',
          availableForReferrals: true,
          availableForMentorship: true,
          bio: 'Leading Logistics Tech at Swiggy. Always hiring high-performing engineers.',
        },
        {
          name: 'Tanvi Shah',
          company: 'Netflix',
          role: 'Senior UI Engineer',
          batch: '2020',
          domain: 'Software Engineering',
          skills: ['React', 'Node.js', 'RxJS', 'CSS Architecture'],
          linkedin: 'https://linkedin.com/in/tanvi-shah',
          email: 'tanvi.shah@netflix.com',
          location: 'Los Gatos, USA',
          availableForReferrals: true,
          availableForMentorship: false,
          bio: 'Optimizing TV app streaming experiences. Can refer top-tier UI developers to Netflix Core Client.',
        }
      ]);
    }
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAlumni = async (req, res) => {
  const { name, company, role, batch, linkedin, email, domain, skills, availableForReferrals, availableForMentorship, location, bio } = req.body;

  try {
    const alumni = await Alumni.create({
      name,
      company,
      role,
      batch,
      linkedin: linkedin || '',
      email: email || '',
      domain: domain || 'Software Engineering',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      availableForReferrals: availableForReferrals !== undefined ? availableForReferrals : true,
      availableForMentorship: availableForMentorship !== undefined ? availableForMentorship : true,
      location: location || 'Remote',
      bio: bio || '',
    });
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
      .populate('student', 'name email phone avatar')
      .populate('job', 'title company location')
      .populate('alumniId', 'name company role email linkedin avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReferralRequest = async (req, res) => {
  const { jobId, jobTitle, alumniId, alumniName, alumniCompany, note, resumeUrl, portfolioUrl } = req.body;

  try {
    if (!alumniName || !alumniCompany) {
      return res.status(400).json({ message: 'Alumni Name and Alumni Company are required fields' });
    }

    const request = await ReferralRequest.create({
      student: req.user._id,
      job: jobId || null,
      jobTitle: jobTitle || '',
      alumniId: alumniId || null,
      alumniName,
      alumniCompany,
      note: note || '',
      resumeUrl: resumeUrl || '',
      portfolioUrl: portfolioUrl || '',
      status: 'Pending',
    });

    const populatedRequest = await ReferralRequest.findById(request._id)
      .populate('student', 'name email phone avatar')
      .populate('job', 'title company location')
      .populate('alumniId', 'name company role email linkedin avatar');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReferralStatus = async (req, res) => {
  const { status, responseNote } = req.body;

  try {
    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    if (status) request.status = status;
    if (responseNote !== undefined) request.responseNote = responseNote;

    await request.save();

    // Notify the student
    await Notification.create({
      recipient: request.student,
      title: `Referral Request Update! 🚀`,
      message: `Your referral request to ${request.alumniName} at ${request.alumniCompany} status is now "${request.status}".`,
    });

    const updatedRequest = await ReferralRequest.findById(request._id)
      .populate('student', 'name email phone avatar')
      .populate('job', 'title company location')
      .populate('alumniId', 'name company role email linkedin avatar');

    res.json(updatedRequest);
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
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role avatar');
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
