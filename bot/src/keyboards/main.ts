import { Markup } from 'telegraf';

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.com';

/**
 * Главная клавиатура с Web App кнопкой
 */
export const mainKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.webApp('🎓 Открыть платформу курсов', WEBAPP_URL)],
    ['📚 Каталог', '🎯 Мои курсы'],
    ['👤 Профиль', '❓ Помощь'],
  ]).resize();
};

/**
 * Inline клавиатура для открытия Mini App
 */
export const webAppButton = () => {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🎓 Открыть платформу', WEBAPP_URL)],
  ]);
};

/**
 * Админ клавиатура
 */
export const adminKeyboard = () => {
  return Markup.keyboard([
    ['📊 Статистика', '📋 Курсы'],
    ['👥 Пользователи', '💰 Продажи'],
    ['🔙 Назад'],
  ]).resize();
};
