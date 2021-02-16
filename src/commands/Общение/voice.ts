import { Message } from 'discord.js';
import config from '../../config';
import * as vars from '../../modules/vars';
import {
  changeState,
  invite,
  kick,
  setLimit,
  VoiceChannelState,
} from '../../modules/channels';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: `Создание и управление голосовым каналом`,
  aliases: ['voice', 'v'],
  usage: 'change/limit',
  cooldown: {
    seconds: 0,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'lock': {
        await changeState(message.author, VoiceChannelState.LOCK);
        return message.reply('канал заблокирован');
      }
      case 'unlock': {
        await changeState(message.author, VoiceChannelState.UNLOCK);
        return message.reply('канал разблокирован');
      }
      case 'set_root': {
        if (!message.guild) {
          return;
        }

        await vars.set(
          message.guild.id,
          'temp_channels_root_id',
          JSON.stringify(args)
        );

        return message.reply('ok!');
      }
      case 'invite': {
        const member = message.mentions.members?.first();

        if (!member) {
          throw new Error('ты никого не упомянул.');
        }

        const chan = await invite(message.author, member);

        return message.channel.send(
          `${member.toString()} был приглашен в <#${chan.voice.id}>`
        );
      }
      case 'kick': {
        const member = message.mentions.members?.first();

        if (!member) {
          throw new Error('ты никого не упомянул.');
        }

        const chan = await kick(message.author, member);

        return message.channel.send(
          `${member.toString()} был кикнут из <#${chan.voice.id}>`
        );
      }
      case 'limit': {
        const limit = Math.min(Number(args[0]) || 0, 99);

        await setLimit(message.author, limit);
        return message.reply(`теперь максимум ${limit}`);
      }
      default: {
        return message.channel.send(helpEmbedMessage);
      }
    }
  },
};

const helpEmbedMessage = {
  embed: {
    color: config.colors.message,
    title: 'Голосовой канал',
    description: 'Свой личный голосовой канал',
    fields: [
      {
        name: 'Список команд',
        value: [
          '`lock/unlock` - Открывает доступ всем',
          '`invite/kick <@>` - Добавление и удаление пользователя из канала',
          '`limit [1-99|none]` - Устанавливает максимальное количество человек в канале',
        ],
        inline: false,
      },
    ],
  },
};
