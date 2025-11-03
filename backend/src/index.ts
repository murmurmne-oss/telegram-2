// ВАЖНО: Загружаем .env в самом начале!
import './config/env';

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import userRoutes from './routes/user.routes';
import purchaseRoutes from './routes/purchase.routes';
import progressRoutes from './routes/progress.routes';
import reviewRoutes from './routes/review.routes';
import promoRoutes from './routes/promo.routes';
import adminRoutes from './routes/admin.routes';

// New comprehensive API routes
import coursesRoutes from './routes/courses';
import lessonsRoutes from './routes/lessons';
import adminApiRoutes from './routes/admin';
import certificatesRoutes from './routes/certificates';
import purchasesRoutes from './routes/purchases';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ===========================
// MIDDLEWARE
// ===========================

// Безопасность
app.use(helmet({
  contentSecurityPolicy: false, // для Telegram Mini App
}));

// CORS
app.use(cors({
  origin: process.env.WEBAPP_URL || '*',
  credentials: true,
}));

// Парсинг тела запроса
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Сжатие ответов
app.use(compression());

// Логирование
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// ===========================
// ROUTES
// ===========================

app.get('/', (req, res) => {
  res.json({
    message: 'Telegram Course Platform API',
    version: '1.0.0',
    status: 'ok',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes (Legacy - keeping for backwards compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promo', promoRoutes);

// New comprehensive API routes
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/purchases', purchasesRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use(errorHandler);

// ===========================
// START SERVER
// ===========================

async function startServer() {
  try {
    // Подключение к БД
    await connectDatabase();
    logger.info('Database connected successfully');

    // Запуск сервера
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Обработка неперехваченных ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
