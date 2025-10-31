import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateTelegram, authenticateJWT } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// POST /api/auth/telegram - Аутентификация через Telegram
router.post('/telegram', authController.loginTelegram);

// GET /api/auth/me - Получить текущего пользователя
router.get('/me', authenticateJWT, authController.getMe);

export default router;
