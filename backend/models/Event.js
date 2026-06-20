import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Placement Drive', 'Hackathon', 'Workshop'],
      default: 'Workshop',
    },
    date: {
      type: String, // String format e.g. "2026-07-15" is easy to input and display
      required: true,
    },
    time: {
      type: String, // String format e.g. "10:00 AM - 11:30 AM"
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Registration Open', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
