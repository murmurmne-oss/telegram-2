import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import path from 'path';

// ВАЖНО: Загружаем .env ДО создания PrismaClient
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Prisma connected to database');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Prisma disconnected from database');
}

export { prisma };
