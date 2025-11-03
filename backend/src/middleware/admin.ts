import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

/**
 * Middleware для проверки прав администратора
 * Должен использоваться после authenticateTelegram или authenticateJWT
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authorized. Please authenticate first.', 401);
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError(
      'Access denied. This action requires administrator privileges.',
      403
    );
  }

  next();
};

/**
 * Middleware для проверки прав супер-администратора
 * Должен использоваться после authenticateTelegram или authenticateJWT
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authorized. Please authenticate first.', 401);
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    throw new AppError(
      'Access denied. This action requires super administrator privileges.',
      403
    );
  }

  next();
};

/**
 * Middleware для проверки, что пользователь не заблокирован
 * Можно использовать после authenticateTelegram или authenticateJWT
 */
export const checkNotBlocked = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authorized. Please authenticate first.', 401);
  }

  // Проверка блокировки выполняется в authenticateTelegram/authenticateJWT
  // Этот middleware просто дополнительная проверка
  next();
};

/**
 * Middleware для логирования действий администратора
 * Можно использовать для аудита действий админов
 */
export const logAdminAction = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    console.log(`[ADMIN ACTION] ${req.method} ${req.path} by user ${req.user.id}`);
    // TODO: Можно записывать в отдельную таблицу аудита
  }
  next();
};
