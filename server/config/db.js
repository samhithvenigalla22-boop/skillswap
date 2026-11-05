const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      if (process.env.NODE_ENV === 'production') {
        console.error('----------------------------------------------------');
        console.error('WARNING: MONGODB_URI is not set in environment variables.');
        console.error('Please configure your MongoDB Atlas connection string in your Render Dashboard.');
        console.error('Example: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority');
        console.error('----------------------------------------------------');
        return null;
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
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MONGODB_URI syntax and credentials in your environment variables.');
    console.error('2. MongoDB Atlas Network Access: Ensure 0.0.0.0/0 (Allow from anywhere) is enabled.');
    console.error('3. Database user has read/write privileges.');
    console.error('----------------------------------------------------');

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
      }
    }
    // In production, do not kill the process so the HTTP server continues to respond
    return null;
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
