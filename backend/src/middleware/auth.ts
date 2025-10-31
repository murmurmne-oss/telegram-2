import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    telegramId: bigint;
    role: string;
  };
}

/**
 * Проверка Telegram WebApp данных
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) return false;

    urlParams.delete('hash');

    // Создаём строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаём секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем хэш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    return false;
  }
}

/**
 * Парсинг Telegram WebApp данных
 */
export function parseTelegramWebAppData(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userString = urlParams.get('user');

  if (!userString) {
    throw new AppError('Invalid Telegram data', 401);
  }

  const user = JSON.parse(userString);

  return {
    telegramId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    photoUrl: user.photo_url,
    languageCode: user.language_code,
    isPremium: user.is_premium,
  };
}

/**
 * Middleware: Аутентификация через Telegram
 */
export const authenticateTelegram = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      throw new AppError('Telegram init data not provided', 401);
    }

    // Валидация данных Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new AppError('Bot token not configured', 500);
    }

    const isValid = validateTelegramWebAppData(initData, botToken);
    if (!isValid) {
      throw new AppError('Invalid Telegram data', 401);
    }

    // Парсинг данных пользователя
    const telegramUser = parseTelegramWebAppData(initData);

    // Найти или создать пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.telegramId) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(telegramUser.telegramId),
          username: telegramUser.username,
          firstName: telegramUser.firstName,
          lastName: telegramUser.lastName,
          photoUrl: telegramUser.photoUrl,
          languageCode: telegramUser.languageCode,
          isPremium: telegramUser.isPremium || false,
        },
      });
    }

    // Проверка блокировки
    if (user.isBlocked) {
      throw new AppError('User is blocked', 403);
    }

    // Добавляем пользователя в request
    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      role: user.role,
    };

    next();
  }
);

/**
 * Middleware: Аутентификация через JWT (опционально)
 */
export const authenticateJWT = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Проверяем Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Или cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Not authorized', 401);
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.isBlocked) {
        throw new AppError('User not found or blocked', 401);
      }

      req.user = {
        id: user.id,
        telegramId: user.telegramId,
        role: user.role,
      };

      next();
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
);

/**
 * Middleware: Проверка роли админа
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authorized', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Access denied. Admin only', 403);
  }

  next();
};

/**
 * Middleware: Проверка роли супер-админа
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authorized', 401);
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Access denied. Super admin only', 403);
  }

  next();
};

/**
 * Генерация JWT токена
 */
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}
