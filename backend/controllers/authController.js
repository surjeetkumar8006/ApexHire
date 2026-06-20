import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    if (user) {
      // If student, create empty profile
      if (user.role === 'student') {
        await Profile.create({
          user: user._id,
          skills: [],
          education: [],
          experience: [],
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coordinators (Admins)
// @route   GET /api/auth/coordinators
// @access  Private (Admin)
export const getCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'admin' }).select('-password');
    res.json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new coordinator (Admin)
// @route   POST /api/auth/coordinators
// @access  Private (Admin)
export const createCoordinator = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const coordinator = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    res.status(201).json({
      _id: coordinator._id,
      name: coordinator.name,
      email: coordinator.email,
      role: coordinator.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coordinator (Admin)
// @route   PUT /api/auth/coordinators/:id
// @access  Private (Admin)
export const updateCoordinator = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const coordinator = await User.findById(req.params.id);

    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    // Check if email is being updated and if it belongs to another user
    if (email && email !== coordinator.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another user' });
      }
      coordinator.email = email;
    }

    if (name) coordinator.name = name;
    if (password) coordinator.password = password;

    const updatedCoordinator = await coordinator.save();

    res.json({
      _id: updatedCoordinator._id,
      name: updatedCoordinator.name,
      email: updatedCoordinator.email,
      role: updatedCoordinator.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coordinator (Admin)
// @route   DELETE /api/auth/coordinators/:id
// @access  Private (Admin)
export const deleteCoordinator = async (req, res) => {
  try {
    const coordinator = await User.findById(req.params.id);

    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    // Prevent admin from deleting themselves
    if (coordinator._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await coordinator.deleteOne();
    res.json({ message: 'Coordinator account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
