import Event from '../models/Event.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    // Auto-seed if empty to provide a great initial experience
    const count = await Event.countDocuments({});
    if (count === 0) {
      await Event.create([
        {
          title: 'Google Pre-Placement Talk',
          date: '2026-07-15',
          time: '10:00 AM - 11:30 AM',
          location: 'Virtual (Zoom)',
          type: 'Placement Drive',
          status: 'Upcoming'
        },
        {
          title: 'Global Hackathon 2026',
          date: '2026-08-01',
          time: '09:00 AM - 09:00 PM',
          location: 'Main Auditorium',
          type: 'Hackathon',
          status: 'Registration Open'
        },
        {
          title: 'Resume Review Workshop',
          date: '2026-06-25',
          time: '02:00 PM - 04:00 PM',
          location: 'Seminar Hall B',
          type: 'Workshop',
          status: 'Upcoming'
        }
      ]);
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
