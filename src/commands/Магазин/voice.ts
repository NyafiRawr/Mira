import * as Discord from 'discord.js';
import config from '../../config';
import CustomError from '../../utils/customError';
import * as economy from '../../modules/economy';
import * as vars from '../../modules/vars';

import { log } from '../../logger';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ролей',
  aliases: ['v'],
  usage: '[create/invite] <@упоминание>',
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],

  async getCategoryId(serverId: string) {
    const value = vars.get<string | null>(serverId, 'TEMP_CHANNELS_CATEGORY_ID', null);
    if (value === null) throw new CustomError('Категория создания каналов не указана, попросите админов сделать это!');

    return value;
  },
  async getPrice(serverId: string) {
    return vars.get(serverId, 'TEMP_CHANNELS_PRICE', 400);
  },

  /**
   * Выполняет комманду и результат возвращяет пользователю
   * @param {Discord.Message} message сообщение
   * @param {string[]} args параметры запроса
   */
  async execute(message: Discord.Message, args: string[]) {
    const tempVoiceName = `${message.member.displayName}`;

    const errorNotEnoughtArgs = `не хватает параметров, пример команды: \`${config.bot.prefix}${this.name} invite ${message.client.user}\``;

    if (args[0] === 'invite') {
      if (args.length <= 1) {
        throw new CustomError(errorNotEnoughtArgs);
      }

      const tempVoice = message.guild.channels.find('name', tempVoiceName);
      for await (const target of message.mentions.members.array()) {
        tempVoice.overwritePermissions(target.id, {
          VIEW_CHANNEL: true,
          CONNECT: true,
          SPEAK: true,
          USE_VAD: true,
        });

        const invite = await tempVoice.createInvite({
          maxAge: 10 * 60 * 1000
        }, `Приглашение в ${tempVoice.toString()}`);
        await message.reply(
          `Пользователь ${target.displayName} добавлен в ${tempVoiceName}. ${invite.url}`
        );
      }
    } else if (args[0] === 'remove') {
      if (args.length <= 1) {
        throw new CustomError(errorNotEnoughtArgs);
      }

      const tempVoice = message.guild.channels.find('name', tempVoiceName);
      for await (const target of message.mentions.members.array()) {
        tempVoice.replacePermissionOverwrites({
          overwrites: tempVoice.permissionOverwrites.filter(
            perm => perm.id !== target.id
          ),
        });

        await message.reply(
          `Пользователь ${target.displayName} удален из ${tempVoiceName}`
        );
      }
    } else if (args[0] === 'create') {
      await economy.pay(message.guild.id, message.author.id, await this.getPrice(message.guild.id));

      const tempVoice = (await message.guild.createChannel(tempVoiceName, {
        type: 'voice',
        permissionOverwrites: [
          {
            id: message.member.id,
            allow: [
              'VIEW_CHANNEL',
              'CONNECT',
              'SPEAK',
              'USE_VAD',
              'MUTE_MEMBERS',
              'DEAFEN_MEMBERS',
            ],
          },
          {
            id: message.guild.defaultRole,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        parent: await this.getCategoryId(message.guild.id),
        topic:
          'Канал будет удален после того, как все выйдут из него!',
      })) as Discord.VoiceChannel;

      const invite = await tempVoice.createInvite({
        maxAge: 10 * 60,
        temporary: true,
      }, `Приглашение в ${tempVoice.toString()}`);
      await message.reply(`Канал __${tempVoice.toString()}__ создан! ${invite.url}`);

      const deleteChannel = () =>
        tempVoice
          .delete()
          .then(() =>
            message.reply(
              `Пустующий канал __${tempVoice.toString()}__ удалён!`
            )
          )
          .catch(log.error);

      setTimeout(() => {
        const watcher = setInterval(
          () =>
            tempVoice.members.size === 0 &&
            deleteChannel() &&
            clearInterval(watcher),
          2e4
        );
      }, 1e4);
    }
  },
};
