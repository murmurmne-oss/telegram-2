import { Context } from 'telegraf';

export async function supportHandler(ctx: Context) {
  await ctx.reply(
    `❓ *Поддержка*\n\n` +
    `Если у вас возникли вопросы или проблемы, напишите нам:\n\n` +
    `📧 Email: support@example.com\n` +
    `💬 Telegram: @support\n\n` +
    `Мы ответим в течение 24 часов!`,
    { parse_mode: 'Markdown' }
  );
}
