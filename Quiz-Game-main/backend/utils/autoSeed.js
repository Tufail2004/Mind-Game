const Question = require('../models/Question');
const questions = require('../seed/questions');

async function autoSeed() {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`Questions already present (${count}), skipping auto-seed.`);
      return;
    }
    await Question.insertMany(questions);
    console.log(`Auto-seeded ${questions.length} questions.`);
  } catch (error) {
    console.error('Auto-seed failed:', error.message);
  }
}

module.exports = autoSeed;
