const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { initSocket } = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const matchRoutes = require('./routes/matchRoutes');
const swapRoutes = require('./routes/swapRoutes');
const messageRoutes = require('./routes/messageRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Client origin configuration with trailing-slash sanitization
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    clientUrl,
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ]),
];

// Helper to validate origin against allowed origins and Vercel domains
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production') return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO CORS blocked origin'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize real-time socket events
initSocket(io);

// Security & utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint that always returns HTTP 200 for Render uptime checks
const healthCheckHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'OK',
    database: isDbConnected ? 'connected' : 'disconnected',
    message: isDbConnected
      ? 'SkillSwap API is healthy and operational'
      : 'SkillSwap API is online (database connection pending or disconnected)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
};

app.get('/api/health', healthCheckHandler);
app.get('/health', healthCheckHandler);
app.get('/', healthCheckHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Start HTTP & WebSocket server immediately on 0.0.0.0 for Render port detection
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`SkillSwap Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Listening on: 0.0.0.0:${PORT}`);
    console.log(`Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`Client URL: ${clientUrl}`);
    console.log(`Demo accounts:`);
    console.log(`  Admin: admin@skillswap.com / Admin@123456`);
    console.log(`  Alex:  alex@skillswap.com / Password@123`);
    console.log(`  Maya:  maya@skillswap.com / Password@123`);
    console.log(`===============================================`);

    // Connect to MongoDB asynchronously in the background so port binding is never delayed
    connectDB()
      .then(async () => {
        try {
          const User = require('./models/User');
          const count = await User.countDocuments();
          if (count === 0) {
            console.log('Database empty: Auto-seeding initial demo users and skills...');
            const { seedDemoData } = require('./scripts/seedDemoData');
            await seedDemoData({ exitProcess: false });
          }
        } catch (seedErr) {
          console.warn('Initial auto-seed check notice:', seedErr.message);
        }
      })
      .catch((dbErr) => {
        console.error('Database connection notice:', dbErr.message);
      });
  });
}

module.exports = { app, server, io };
