import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Handlers
import { startHandler } from './handlers/start';
import { coursesHandler } from './handlers/courses';
import { myCoursesHandler } from './handlers/myCourses';
import { profileHandler } from './handlers/profile';
import { supportHandler } from './handlers/support';
import { adminHandler } from './handlers/admin';

dotenv.config({ path: '../.env' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

if (!WEBAPP_URL) {
  throw new Error('WEBAPP_URL is not defined');
}

// Создание бота
const bot = new Telegraf(BOT_TOKEN);

// ===========================
// MIDDLEWARE
// ===========================

// Логирование
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.updateType} - ${ms}ms`, {
    userId: ctx.from?.id,
    username: ctx.from?.username,
  });
});

// ===========================
// КОМАНДЫ
// ===========================

bot.command('start', startHandler);
bot.command('courses', coursesHandler);
bot.command('my_courses', myCoursesHandler);
bot.command('profile', profileHandler);
bot.command('support', supportHandler);
bot.command('admin', adminHandler);

// Help команда
bot.command('help', (ctx) => {
  ctx.reply(
    `🎓 *Доступные команды:*\n\n` +
    `/start - Открыть платформу курсов\n` +
    `/courses - Каталог курсов\n` +
    `/my_courses - Мои курсы\n` +
    `/profile - Профиль\n` +
    `/support - Поддержка\n` +
    `/help - Помощь`,
    { parse_mode: 'Markdown' }
  );
});

// ===========================
// ОБРАБОТКА CALLBACK QUERIES
// ===========================

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'open_app') {
    await ctx.answerCbQuery();
    await ctx.reply(
      '👆 Нажмите на кнопку меню внизу или используйте команду /start',
    );
  } else {
    await ctx.answerCbQuery('Функция в разработке');
  }
});

// ===========================
// ОБРАБОТКА ПЛАТЕЖЕЙ
// ===========================

// Pre-checkout query (перед оплатой)
bot.on('pre_checkout_query', async (ctx) => {
  try {
    // Здесь можно добавить проверку доступности курса и цены
    await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    logger.error('Pre-checkout error:', error);
    await ctx.answerPreCheckoutQuery(false, 'Ошибка при проверке платежа');
  }
});

// Successful payment
bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message?.successful_payment;
  if (!payment) return;

  try {
    // Парсим payload для получения courseId
    const payload = JSON.parse(payment.invoice_payload);
    const { courseId } = payload;

    // Здесь нужно сделать запрос к API для подтверждения покупки
    // и выдачи доступа к курсу

    await ctx.reply(
      `✅ *Оплата успешна!*\n\n` +
      `Сумма: ${(payment.total_amount / 100).toFixed(2)} ${payment.currency}\n\n` +
      `Курс доступен в разделе "Мои курсы" 🎓\n\n` +
      `Приятного обучения!`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    logger.error('Payment processing error:', error);
    await ctx.reply('Оплата получена, но произошла ошибка. Обратитесь в поддержку.');
  }
});

// ===========================
// ОБРАБОТКА ОШИБОК
// ===========================

bot.catch((err, ctx) => {
  logger.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.');
});

// ===========================
// ЗАПУСК БОТА
// ===========================

async function startBot() {
  try {
    // Запуск бота
    await bot.launch();
    logger.info('Bot started successfully');
    logger.info(`Bot username: @${bot.botInfo?.username}`);
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Graceful stop
process.once('SIGINT', () => {
  logger.info('SIGINT received, stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('SIGTERM received, stopping bot...');
  bot.stop('SIGTERM');
});

startBot();

export default bot;
