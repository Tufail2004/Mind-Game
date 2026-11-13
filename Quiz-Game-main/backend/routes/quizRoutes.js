const express = require('express');
const { getQuizQuestions, submitResult, getAllResults } = require('../controllers/quizController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/questions', getQuizQuestions);
router.get('/results', protect, admin, getAllResults);
router.post('/result', protect, submitResult);

module.exports = router;
