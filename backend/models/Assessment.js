import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true }, // 0-based index of options array
});

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
});

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['Aptitude', 'Coding', 'General'], required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // in minutes
    questions: { type: [questionSchema], required: true },
    submissions: { type: [submissionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
