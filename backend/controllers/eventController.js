import Event from '../models/Event.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const defaultEvents = [
      {
        title: 'Resume Review & LinkedIn Clinic',
        date: '2026-06-25',
        time: '02:00 PM - 04:00 PM',
        location: 'Seminar Hall B',
        type: 'Workshop',
        status: 'Completed',
        description: 'One-on-one resume critique, ATS keyword optimization, and LinkedIn profile audit.'
      },
      {
        title: 'Summer Code Sprint Hackathon 2026',
        date: '2026-08-01',
        time: '09:00 AM - 09:00 PM',
        location: 'Main Auditorium',
        type: 'Hackathon',
        status: 'Completed',
        description: '12-hour intensive hackathon focused on full-stack web and mobile application development.'
      },
      {
        title: 'Google Pre-Placement & AI Tech Talk',
        date: '2026-09-25',
        time: '10:00 AM - 11:30 AM',
        location: 'Virtual (Zoom)',
        type: 'Placement Drive',
        status: 'Registration Open',
        description: 'Exclusive session with Google tech leads covering System Design, GenAI interview prep, and placement opportunities.'
      },
      {
        title: 'Microsoft Azure & Cloud Systems Hackathon',
        date: '2026-10-12',
        time: '09:00 AM - 06:00 PM',
        location: 'Main Campus Auditorium',
        type: 'Hackathon',
        status: 'Registration Open',
        description: 'Annual campus cloud hackathon sponsored by Microsoft Azure with prizes worth ₹5 Lakhs & direct interview fast-track passes.'
      },
      {
        title: 'Amazon AWS Distributed Microservices Workshop',
        date: '2026-10-28',
        time: '02:00 PM - 05:00 PM',
        location: 'Seminar Hall B',
        type: 'Workshop',
        status: 'Upcoming',
        description: 'Hands-on workshop on AWS Lambda, DynamoDB, API Gateways, and high-throughput backend architecture.'
      },
      {
        title: 'TCS & Infosys National Qualifier Test (NQT) Drive',
        date: '2026-11-10',
        time: '09:00 AM - 04:00 PM',
        location: 'Placement Cell - Lab 3',
        type: 'Placement Drive',
        status: 'Registration Open',
        description: 'Mass recruitment drive for Associate Software Engineer and Systems Engineer roles across top IT services leaders.'
      },
      {
        title: 'Meta React 19 & Web Architecture Summit',
        date: '2026-11-25',
        time: '03:00 PM - 05:00 PM',
        location: 'Virtual (MS Teams)',
        type: 'Workshop',
        status: 'Upcoming',
        description: 'Deep dive into modern web performance, React Server Components, and large-scale UI architecture.'
      }
    ];

    const eventsCount = await Event.countDocuments({});
    const hasUpcoming = await Event.exists({ date: { $gte: todayStr } });

    if (eventsCount === 0 || !hasUpcoming) {
      await Event.deleteMany({});
      await Event.create(defaultEvents);
    } else {
      const allEvents = await Event.find({});
      for (const evt of allEvents) {
        if (evt.date && evt.date < todayStr && evt.status !== 'Completed') {
          evt.status = 'Completed';
          await evt.save();
        }
      }
    }

    const events = await Event.find({})
      .populate('registeredStudents', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res) => {
  const { title, type, date, time, location, description, status } = req.body;

  try {
    if (!title || !type || !date || !time || !location) {
      return res.status(400).json({ message: 'Please provide all required fields (title, type, date, time, location)' });
    }

    const event = await Event.create({
      title,
      type,
      date,
      time,
      location,
      description,
      status: status || 'Upcoming',
    });

    // Notify all students about the new event
    try {
      const students = await User.find({ role: 'student' });
      const notificationsArray = students.map((student) => ({
        recipient: student._id,
        title: 'New Career Event Scheduled 🗓',
        message: `A new placement preparation event "${title}" has been scheduled for ${date} at ${location}.`,
      }));
      if (notificationsArray.length > 0) {
        await Notification.insertMany(notificationsArray);
      }
    } catch (notifErr) {
      console.error('Failed to dispatch bulk event notifications:', notifErr);
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();
      res.json({ message: 'Event removed successfully' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a student for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'Registration Open') {
      return res.status(400).json({ 
        message: event.status === 'Completed' ? 'Event has ended' : 'Registration has not opened yet for this event' 
      });
    }

    // Check if student is already registered
    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    event.registeredStudents.push(req.user._id);
    await event.save();
    
    // Fetch populated event to return
    const updatedEvent = await Event.findById(event._id).populate('registeredStudents', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister a student from an event
// @route   POST /api/events/:id/unregister
// @access  Private (Student)
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student is registered
    if (!event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.registeredStudents = event.registeredStudents.filter(
      (studentId) => studentId.toString() !== req.user._id.toString()
    );
    
    await event.save();

    // Fetch populated event to return
    const updatedEvent = await Event.findById(event._id).populate('registeredStudents', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
