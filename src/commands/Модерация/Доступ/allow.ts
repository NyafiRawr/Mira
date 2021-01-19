import { Message } from 'discord.js';
import * as access from '../../../modules/access';

export const allow = async (message: Message, args: string[]) => {
  const channelId = message.mentions.channels.first()?.id || null;
  if (channelId) {
    args.shift();
  }
  const commandName = args.shift() || null;

  const isExist = await access.remove(
    message.guild!.id,
    channelId,
    commandName
  );

  if (isExist) {
    await message.reply(
      'указанный запрет удален :negative_squared_cross_mark:'
    );
  } else {
    await message.reply('такой запрет не найден :x:');
  }
};
