const express = require('express');
const { play, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/play', play);
router.get('/me', protect, getMe);

module.exports = router;
