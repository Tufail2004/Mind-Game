// The server recomputes scores from database answers before storing results.

const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');

const POINTS = { easy: 10, medium: 20, hard: 30 };
const QUESTIONS_PER_QUIZ = 10;

async function getQuizQuestions(req, res, next) {
  try {
    const { category, difficulty } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Query parameter "category" is required' });
    }

    const match = { category };
    if (difficulty && difficulty !== 'mixed') {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty — use easy, medium or hard' });
      }
      match.difficulty = difficulty;
    }

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: QUESTIONS_PER_QUIZ } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this category/difficulty' });
    }

    res.json({ count: questions.length, questions });
  } catch (error) {
    next(error);
  }
}

async function submitResult(req, res, next) {
  try {
    const { category, difficulty, answers, timeTaken } = req.body;

    if (!category || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'category and a non-empty answers array are required' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const byId = new Map(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let score = 0;

    for (const answer of answers) {
      const question = byId.get(String(answer.questionId));
      if (!question) {
        unanswered += 1;
        continue;
      }
      if (answer.selected == null || answer.selected === '') {
        unanswered += 1; // timer ran out on this question
      } else if (answer.selected === question.correctAnswer) {
        correct += 1;
        score += POINTS[question.difficulty] || 0;
      } else {
        incorrect += 1;
      }
    }

    const totalQuestions = answers.length;
    const percentage = Math.round((correct / totalQuestions) * 100);

    const result = await QuizResult.create({
      user: req.user._id,
      category,
      difficulty: difficulty || 'mixed',
      score,
      totalQuestions,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unanswered,
      percentage,
      timeTaken: timeTaken || 0,
    });

    res.status(201).json({
      resultId: result._id,
      score,
      totalQuestions,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unanswered,
      percentage,
      timeTaken: result.timeTaken,
    });
  } catch (error) {
    next(error);
  }
}

async function getAllResults(req, res, next) {
  try {
    const results = await QuizResult.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(results);
  } catch (error) {
    next(error);
  }
}

module.exports = { getQuizQuestions, submitResult, getAllResults };
