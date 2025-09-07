import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Ensure we load the correct .env from the backend directory before loading modules that use env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { connectDB } from './config/db.js';

// Import routes AFTER dotenv so modules that need env (e.g., firebase) see it
const { default: authRoutes } = await import('./routes/auth.js');
const { default: clubRoutes } = await import('./routes/clubs.js');
const { default: tournamentRoutes } = await import('./routes/tournaments.js');
const { default: adminRoutes } = await import('./routes/admin.js');
const { default: userRoutes } = await import('./routes/users.js');
const { errorHandler, logger } = await import('./utils/logger.js');

const app = express();

// CORS configuration with better security
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cookieParser());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
await connectDB(process.env.MONGO_URI);
app.listen(PORT, () => console.log(`API on :${PORT} (CORS: ${allowedOrigins.join(', ')})`));