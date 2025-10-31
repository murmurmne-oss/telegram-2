import { Context } from 'telegraf';
import { webAppButton } from '../keyboards/main';

export async function myCoursesHandler(ctx: Context) {
  await ctx.reply(
    `🎯 *Мои курсы*\n\n` +
    `Открой платформу, чтобы увидеть свои курсы и продолжить обучение!`,
    {
      ...webAppButton(),
      parse_mode: 'Markdown',
    }
  );
}
