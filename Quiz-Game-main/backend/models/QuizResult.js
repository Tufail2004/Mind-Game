const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true, default: 0 },
    incorrectAnswers: { type: Number, required: true, default: 0 },
    unanswered: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    timeTaken: { type: Number, default: 0 }, // total seconds for the quiz
  },
  { timestamps: true }
);

quizResultSchema.index({ score: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
