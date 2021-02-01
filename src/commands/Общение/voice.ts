import { Message } from 'discord.js';
import config from '../../config';
import * as vars from '../../modules/vars';
import { VoiceChannelState } from '../../modules/channels';

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
        return voiceLock(message, VoiceChannelState.LOCK);
      }
      case 'unlock': {
        return voiceLock(message, VoiceChannelState.UNLOCK);
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

        return message.react('ok');
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

const voiceLock = async (message: Message, value: VoiceChannelState): Promise<void> => {
  // const user = message.author;

  await message.channel.send(value);
};
