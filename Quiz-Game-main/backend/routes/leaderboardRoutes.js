const express = require('express');
const QuizResult = require('../models/QuizResult');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const top = await QuizResult.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(20)
      .populate('user', 'name'); // only bring in the player's name
    res.json(top);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
