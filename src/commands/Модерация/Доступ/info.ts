import { Collection, Message } from 'discord.js';
import config from '../../../config';
import * as access from '../../../modules/access';

export const info = async (message: Message) => {
  const records = await access.getAll(message.guild!.id);

  const server: string[] = []; // Заблокированые команды на всем сервере
  const channel: string[] = []; // Заблокированые для команд каналы
  const commandByChannel: string[] = [];
  const command = new Collection<string, string[]>(); // Остальные заблокированые команды по каналам

  for await (const record of records) {
    if (record.channelId === null && record.commandName !== null) {
      server.push(record.commandName);
    } else if (record.channelId !== null && record.commandName === null) {
      channel.push(record.channelId);
    } else if (record.channelId !== null && record.commandName !== null) {
      if (
        server.includes(record.commandName) &&
        channel.includes(record.channelId) === false
      ) {
        const commandNames = command.get(record.channelId);
        if (commandNames === undefined) {
          command.set(record.channelId, [record.commandName]);
        } else {
          command.set(
            record.channelId,
            commandNames.concat(record.commandName)
          );
        }
      }
    }
  }

  channel.map((channelId) =>
    commandByChannel.push(`<#${channelId}> - ЗАПРЕЩЕНО ВСЁ`)
  );

  command.map((commandNames, channelId) =>
    commandByChannel.push(`<#${channelId}> - ${commandNames.join(', ')}`)
  );

  await message.channel.send({
    embed: {
      color: config.colors.message,
      author: {
        name: 'Управление доступом к командам бота',
      },
      fields: [
        {
          name: 'Команды запрещенные на сервере',
          value:
            (server.map((commandName) => `${commandName}`).join(', ') ||
              'Нет') +
            '\n' +
            `\n\`${config.discord.prefix}access deny <команда>\` - запретить команду на всём сервере` +
            `\n\`${config.discord.prefix}access allow <команда>\` - удалить запрет`,
          inline: false,
        },
        {
          name: 'Запрещенные команды по каналам',
          value:
            (commandByChannel.join('\n') || 'Нет') +
            '\n' +
            `\n\`${config.discord.prefix}access allow <#> [команда]\` - удалить запрет в #канале [для команды]` +
            `\n\`${config.discord.prefix}access deny <#> [команда]\` - запретить бота [или команду] в #канале`,
          inline: false,
        },
      ],
      footer: {
        text: 'Важно: алиасы считаются отдельными командами',
      },
    },
  });
};
