import { Message } from 'discord.js';
import * as access from '../../../modules/access';

export const allow = async (message: Message, args: string[]) => {
  if (args.length === 0) {
    const isRemove = await access.removeByServer(message.guild!.id);
    if (isRemove) {
      await message.reply(
        'все серверные заперты удалены :negative_squared_cross_mark:'
      );
    } else {
      await message.reply('серверных запретов нет, удалять нечего :x:');
    }
    return;
  }

  const channelId = message.mentions.channels.first()?.id || null;
  if (channelId) {
    args.shift();
  }

  const commandName = args.shift() || null;

  if (channelId !== null && commandName === null) {
    const isRemove = await access.removeByChannel(message.guild!.id, channelId);
    if (isRemove) {
      await message.reply(
        'все заперты в канале удалены :negative_squared_cross_mark:'
      );
    } else {
      await message.reply(
        `у канала <#${channelId}> нет запретов, удалять нечего :x:`
      );
    }
    return;
  }

  const isRemove = await access.removeByCommand(
    message.guild!.id,
    channelId,
    commandName
  );

  if (isRemove) {
    await message.reply(
      'указанный запрет удален :negative_squared_cross_mark:'
    );
  } else {
    await message.reply('такой запрет не найден :x:');
  }
};
