import { Message } from 'discord.js';
import config from '../../config';
import {
  separateThousandth,
  timeFomattedDMYHHMMSS,
  timeLifeFormattedYMD,
} from '../../utils';
import verificationLevels from './verificationLevels.json';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'О сервере',
  aliases: ['serverinfo'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message) {
    const botCount = message.guild!.members.cache.filter(
      (member) => member.user.bot
    ).size;

    message.channel.send({
      embed: {
        color: config.colors.message,
        author: {
          name: message.guild!.name,
          icon_url: message.guild!.iconURL() || '',
        },
        image: {
          url: message.guild!.splashURL() || message.guild!.bannerURL() || '',
        },
        fields: [
          { name: 'Местный тиран', value: message.guild!.owner, inline: true },
          {
            name: 'Уровень проверки',
            value: verificationLevels[message.guild!.verificationLevel],
            inline: true,
          },
          {
            name: 'Местонахождение',
            value: `:flag_${message.guild!.region.substr(0, 2)}:`,
            inline: true,
          },
          {
            name: 'Участники',
            value: separateThousandth(
              (message.guild!.memberCount - botCount).toString()
            ),
            inline: true,
          },
          { name: 'Боты', value: botCount, inline: true },
          {
            name: 'Каналы',
            value: `${message.guild!.channels.cache.size} / 255`,
            inline: true,
          },
          {
            name: `Роли (${message.guild!.roles.cache.size - 1} / 255)`,
            value:
              message
                .guild!.roles.cache.map((r) => r.toString().trim())
                .join(' ')
                .substr(0, 1024) || 'Нет',
          },
          {
            name: `Эмодзи (${message.guild!.emojis.cache.size})`,
            value:
              message
                .guild!.emojis.cache.map((e) => e.toString())
                .join(' ')
                .substr(0, 1024) || 'Нет',
          },
        ],
        footer: {
          text: `${timeFomattedDMYHHMMSS(
            message.guild!.createdAt.getTime()
          )} | ${timeLifeFormattedYMD(message.guild!.createdAt.getTime())}`,
        },
      },
    });
  },
};
