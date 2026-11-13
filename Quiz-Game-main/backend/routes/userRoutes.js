const express = require('express');
const { getProfile, getHistory, getAllUsers } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/profile', protect, getProfile);
router.get('/history', protect, getHistory);

module.exports = router;
