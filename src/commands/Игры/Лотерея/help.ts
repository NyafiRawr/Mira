import { Message } from 'discord.js';
import config from '../../../config';

export const help = async (message: Message) => {
  await message.channel.send({
    embed: {
      color: config.games.lottery.color,
      author: {
        name: 'Лотерея',
      },
      fields: [
        {
          name: 'Команды',
          value:
            `\`${config.discord.prefix}lottery create <ставка> [кол-во участников] [@,@,...]\` - создать` +
            `\n\`${config.discord.prefix}lottery close\` - закрыть и вернуть себе :cookie:` +
            `\n\`${config.discord.prefix}lottery info\` - узнать больше` +
            `\n\`${config.discord.prefix}lottery join\` - присоединиться`,
          inline: false,
        },
        {
          name: 'Настройка',
          value: `\`${config.discord.prefix}lottery maxmembers <кол-во>\` - изменить предел участников`,
          inline: false,
        },
      ],
      footer: { text: 'Лотерея сбрасывается при перезагрузке бота' },
    },
  });
};
