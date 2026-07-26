import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config';
import { prisma } from './db/prisma';
import { redisConnection } from './config/redis';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { startEmailWorker } from './workers/emailWorker';
import { getMailer } from './utils/mailer';

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

let server: any;
let worker: any;

const startServer = async () => {
  try {
    // 1. Verify PostgreSQL connection via Prisma
    await prisma.$connect();
    console.log('[Database] Connected successfully to PostgreSQL via Prisma');

    // 2. Initialize Mailer Ethereal/SMTP transport
    await getMailer();

    // 3. Start BullMQ concurrency worker
    worker = startEmailWorker();

    // 4. Start HTTP Server
    server = app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 ReachInbox Scheduler Backend running on port ${config.port}`);
      console.log(`📊 API Base URL: http://localhost:${config.port}/api`);
      console.log(`🐳 Worker Concurrency: ${config.workerConcurrency}`);
      console.log(`⏱️ Min Delay: ${config.minDelaySeconds}s | Max/Hr: ${config.maxEmailsPerHour}`);
      console.log(`======================================================\n`);
    });
  } catch (err: any) {
    console.error('[Fatal Startup Error]', err.message);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  if (worker) {
    await worker.close();
    console.log('[BullMQ Worker] Closed');
  }
  if (server) {
    server.close(() => console.log('[HTTP Server] Closed'));
  }
  await prisma.$disconnect();
  console.log('[Prisma] Disconnected');
  await redisConnection.quit();
  console.log('[Redis] Disconnected');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
