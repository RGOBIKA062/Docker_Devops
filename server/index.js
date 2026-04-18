import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import codeExecutionRoutes from './routes/codeExecutionRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import industryRoutes from './routes/industryRoutes.js';
import jobAndDriveRoutes from './routes/jobAndDriveRoutes.js';
import { errorHandler } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * ==========================================
 * MIDDLEWARE
 * ==========================================
 */

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081', 
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
    ];
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

/**
 * ==========================================
 * DATABASE CONNECTION & INITIALIZATION
 * ==========================================
 */

connectDB();

// Initialize database collections and indexes
async function initializeCollections() {
  try {
    const Freelancer = (await import('./models/Freelancer.js')).default;
    const collections = await mongoose.connection.db.listCollections().toArray();
    const freelancerCollectionExists = collections.some(col => col.name === 'freelancers');

    if (!freelancerCollectionExists) {
      console.log('📝 Creating freelancers collection with indexes...');
      try {
        await Freelancer.collection.createIndex({ userId: 1 });
        await Freelancer.collection.createIndex({ 'profile.email': 1 }, { sparse: true });
        console.log('✅ Freelancers collection initialized with indexes');
      } catch (e) {
        // Index errors are okay if collection exists
      }
    } else {
      console.log('✅ Freelancers collection already exists with all required indexes');
    }
  } catch (error) {
    if (!error.message.includes('An existing index')) {
      console.error('❌ Error initializing collections:', error.message);
    }
  }
}

// Initialize after a delay to ensure MongoDB connection is ready
setTimeout(initializeCollections, 1500);

/**
 * ==========================================
 * HEALTH CHECK ENDPOINT
 * ==========================================
 */

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AllCollegeEvents Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * ==========================================
 * API ROUTES
 * ==========================================
 */

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/execute', codeExecutionRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api', jobAndDriveRoutes);

/**
 * ==========================================
 * 404 HANDLER
 * ==========================================
 */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/**
 * ==========================================
 * ERROR HANDLER (Must be last)
 * ==========================================
 */

app.use(errorHandler);

/**
 * ==========================================
 * START SERVER
 * ==========================================
 */

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   AllCollegeEvents Server Started      ║
║   🚀 Port: ${PORT}                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}         ║
║   📦 MongoDB: Connected                ║
║   🔗 Address: http://127.0.0.1:${PORT}                  ║
╚════════════════════════════════════════╝
  `);
  console.log('✅ Server is now listening for incoming requests...');
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('close', () => {
  console.log('⚠️  Server closed');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err?.message || err}`);
  // Don't immediately exit - log and continue
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err?.message || err}`);
  // Don't immediately exit - log and continue
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
