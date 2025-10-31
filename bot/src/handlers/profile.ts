import { Context } from 'telegraf';
import { webAppButton } from '../keyboards/main';

export async function profileHandler(ctx: Context) {
  await ctx.reply(
    `👤 *Профиль*\n\n` +
    `Открой платформу, чтобы увидеть свой профиль!`,
    {
      ...webAppButton(),
      parse_mode: 'Markdown',
    }
  );
}
