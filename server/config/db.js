const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: MONGODB_URI is not set in production environment variables.');
        console.error('Please configure your MongoDB Atlas connection string in your hosting environment (e.g., Render Dashboard).');
        process.exit(1);
      }
      console.log('No MONGODB_URI provided in environment. Initializing MongoMemoryServer for development/testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log(`In-memory MongoDB started at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('MongoMemoryServer fallback initialization error:', memErr.message);
        mongoUri = 'mongodb://127.0.0.1:27017/skillswap';
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If connection to specified URI fails in development, try in-memory fallback
    if (process.env.NODE_ENV !== 'production' && !mongod) {
      console.log('Attempting in-memory fallback for local development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`Fallback in-memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error('Fatal: Could not initialize database fallback:', fallbackErr.message);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
};

module.exports = { connectDB, closeDB };
