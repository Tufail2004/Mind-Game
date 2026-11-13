require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = require('./questions');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // This seed command replaces the entire question collection.
    await Question.deleteMany({});
    const inserted = await Question.insertMany(questions);

    console.log(`Seeded ${inserted.length} questions successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
