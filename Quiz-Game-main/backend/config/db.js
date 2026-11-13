const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error('MongoDB connection failed: MONGO_URI is not set. Copy .env.example to .env and configure your MongoDB connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the server — it cannot work without the database
  }
}

module.exports = connectDB;
