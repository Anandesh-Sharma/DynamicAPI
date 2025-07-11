import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import 'express-async-errors';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { prisma } from './utils/database';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/teams';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join project rooms for real-time updates
  socket.on('join-project', (projectId: string) => {
    socket.join(`project-${projectId}`);
    logger.info(`User ${socket.id} joined project ${projectId}`);
  });

  // Leave project rooms
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project-${projectId}`);
    logger.info(`User ${socket.id} left project ${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export { io };