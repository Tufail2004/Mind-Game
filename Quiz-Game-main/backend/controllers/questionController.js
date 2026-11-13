const Question = require('../models/Question');

function hideAnswer(questionDoc) {
  const obj = questionDoc.toObject();
  delete obj.correctAnswer;
  return obj;
}

async function getQuestions(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    const isAdmin = req.user && req.user.role === 'admin';
    res.json(isAdmin ? questions : questions.map(hideAnswer));
  } catch (error) {
    next(error);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const isAdmin = req.user && req.user.role === 'admin';
    res.json(isAdmin ? question : hideAnswer(question));
  } catch (error) {
    next(error);
  }
}

async function createQuestion(req, res, next) {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
