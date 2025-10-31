import { Context } from 'telegraf';
import { adminKeyboard } from '../keyboards/main';

// Список ID админов (загружается из env)
const ADMIN_IDS = process.env.ADMIN_TELEGRAM_ID
  ? process.env.ADMIN_TELEGRAM_ID.split(',').map(id => parseInt(id.trim()))
  : [];

export async function adminHandler(ctx: Context) {
  const userId = ctx.from?.id;

  // Проверка прав админа
  if (!userId || !ADMIN_IDS.includes(userId)) {
    await ctx.reply('❌ У вас нет доступа к админ панели');
    return;
  }

  await ctx.reply(
    `🔐 *Админ панель*\n\n` +
    `Выберите действие:`,
    {
      ...adminKeyboard(),
      parse_mode: 'Markdown',
    }
  );
}
