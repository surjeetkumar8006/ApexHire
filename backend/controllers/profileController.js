import Profile from '../models/Profile.js';
import User from '../models/User.js';

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role'
    );

    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
      profile = await Profile.findOne({ user: req.user._id }).populate(
        'user',
        'name email role'
      );
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private (Student)
export const updateStudentProfile = async (req, res) => {
  const { skills, education, experience, portfolioLinks, projects, achievements } = req.body;

  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      if (skills) profile.skills = skills;
      if (education) profile.education = education;
      if (experience) profile.experience = experience;
      if (portfolioLinks) profile.portfolioLinks = portfolioLinks;
      if (projects) profile.projects = projects;
      if (achievements) profile.achievements = achievements;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings (User and Profile combined)
// @route   PUT /api/profile/settings
// @access  Private
export const updateSettings = async (req, res) => {
  const { name, phone, avatar, password, twoFactorEnabled, notificationPreferences, privacy } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password; // will be hashed by pre-save hook
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
    
    await user.save();

    if (notificationPreferences) profile.notificationPreferences = notificationPreferences;
    if (privacy) profile.privacy = privacy;

    const updatedProfile = await profile.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled
      },
      profile: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile by user ID (for Admin review)
// @route   GET /api/profile/user/:id
// @access  Private (Admin)
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      'user',
      'name email role'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all student profiles
// @route   GET /api/profile/all
// @access  Private (Admin)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', 'name email role');
    const studentProfiles = profiles.filter(p => p.user && p.user.role === 'student');
    res.json(studentProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle student verification status
// @route   PUT /api/profile/verify/:id
// @access  Private (Admin)
export const toggleVerification = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.isVerified = !profile.isVerified;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public profile by username slug
// @route   GET /api/profile/public/:username
// @access  Public
export const getPublicProfile = async (req, res) => {
  try {
    // 1. Find all users with that name slug. We construct a regex to match the name.
    // The username in URL is something like 'surjeet-kumar'. We want to match 'Surjeet Kumar'.
    const slugParts = req.params.username.split('-');
    // Create a flexible regex. e.g. /surjeet.*kumar/i
    const regex = new RegExp(slugParts.join('.*'), 'i');

    const user = await User.findOne({ name: regex });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ user: user._id }).populate('user', 'name email avatar');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if the profile is public
    if (profile.privacy && profile.privacy.profileVisibility === 'private') {
      return res.status(403).json({ message: 'This profile is private' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
