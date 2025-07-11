import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

// Log database errors
prisma.$on('error', (e: any) => {
  logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e: any) => {
  logger.info('Database info:', e.message);
});

// Log database warnings
prisma.$on('warn', (e: any) => {
  logger.warn('Database warning:', e.message);
});