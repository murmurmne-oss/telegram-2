import { Context } from 'telegraf';
import { webAppButton } from '../keyboards/main';

export async function coursesHandler(ctx: Context) {
  await ctx.reply(
    `📚 *Каталог курсов*\n\n` +
    `Открой платформу, чтобы увидеть все доступные курсы!`,
    {
      ...webAppButton(),
      parse_mode: 'Markdown',
    }
  );
}
