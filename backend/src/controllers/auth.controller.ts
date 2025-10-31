import { Response } from 'express';
import { AuthRequest, parseTelegramWebAppData, validateTelegramWebAppData, generateToken } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Аутентификация через Telegram Mini App
   */
  loginTelegram = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { initData } = req.body;

    if (!initData) {
      throw new AppError('initData is required', 400);
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
      // Создать нового пользователя
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
    } else {
      // Обновить данные существующего пользователя
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: telegramUser.username,
          firstName: telegramUser.firstName,
          lastName: telegramUser.lastName,
          photoUrl: telegramUser.photoUrl,
          isPremium: telegramUser.isPremium || false,
        },
      });
    }

    // Проверка блокировки
    if (user.isBlocked) {
      throw new AppError('User is blocked', 403);
    }

    // Генерация JWT токена
    const token = generateToken(user.id);

    // Отправка ответа
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          telegramId: user.telegramId.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          role: user.role,
          isPremium: user.isPremium,
        },
        token,
      },
    });
  });

  /**
   * Получить текущего пользователя
   */
  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Not authorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        role: true,
        isPremium: true,
        languageCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...user,
        telegramId: user.telegramId.toString(),
      },
    });
  });
}
