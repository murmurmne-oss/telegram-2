import { Context } from 'telegraf';
import { mainKeyboard, webAppButton } from '../keyboards/main';

export async function startHandler(ctx: Context) {
  const firstName = ctx.from?.first_name || 'друг';

  await ctx.reply(
    `👋 Привет, ${firstName}!\n\n` +
    `Добро пожаловать на платформу онлайн-курсов! 🎓\n\n` +
    `Здесь ты можешь:\n` +
    `• Изучать интересные курсы\n` +
    `• Отслеживать свой прогресс\n` +
    `• Получать сертификаты\n\n` +
    `Нажми на кнопку ниже, чтобы начать! 👇`,
    {
      ...mainKeyboard(),
      parse_mode: 'Markdown',
    }
  );

  // Дополнительно отправляем inline кнопку
  await ctx.reply(
    `Или используй эту кнопку:`,
    webAppButton()
  );
}
