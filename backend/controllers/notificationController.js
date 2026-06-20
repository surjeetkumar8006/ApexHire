import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      if (notification.recipient.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to modify this notification' });
      }

      notification.read = true;
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Broadcast system announcement to all students
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
export const createBroadcastAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const students = await User.find({ role: 'student' });
    const notifications = students.map((student) => ({
      recipient: student._id,
      title,
      message,
      read: false,
    }));

    await Notification.insertMany(notifications);
    res.status(201).json({ message: `Announcement broadcasted to ${students.length} students successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

