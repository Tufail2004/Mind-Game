const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function play(req, res, next) {
  try {
    const name = (req.body.name || '').trim();

    if (name.length < 2) {
      return res.status(400).json({ message: 'Please tell us your name (at least 2 letters) 😊' });
    }
    if (name.length > 30) {
      return res.status(400).json({ message: 'That name is a bit too long — 30 letters max!' });
    }

    let user = await User.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') });
    if (!user) {
      user = await User.create({ name });
    }

    res.json({ user, token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { play, getMe };
