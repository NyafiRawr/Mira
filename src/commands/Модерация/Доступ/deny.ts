import { Message } from 'discord.js';
import * as access from '../../../modules/access';
import { commandsList, commandsExcludes } from '../../../commands';

export const deny = async (message: Message, args: string[]) => {
  const channelId = message.mentions.channels.first()?.id || null;
  if (channelId) {
    args.shift();
  }
  const commandName = args.shift() || null;
  if (commandName !== null) {
    if (commandsExcludes.includes(commandName)) {
      throw new Error(
        'эту команду нельзя заблокировать, потому что она находится в списке исключений :x:'
      );
    }
    if (commandsList.has(commandName) === false) {
      throw new Error('указанного имени команды у меня нет :x:');
    }
  }

  await access.set(message.guild!.id, channelId, commandName);

  await message.reply('указанный запрет добавлен :white_check_mark: ');
};
