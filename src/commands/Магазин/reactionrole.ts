import CustomError from '../../utils/customError';
import * as ReactionRoles from '../../modules/reactionroles';
import { randomHexColor } from '../../utils/tools';
import * as Discord from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Роль по реакции к сообщению',
  aliases: ['rr'],
  usage: '<#канал> <id-сообщения> <реакция> <@роль>, ...',
  guild: true,
  hide: true,
  permissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять ролями!');
    }
    if (!message.guild.me.hasPermission(this.permissions[0])) {
      throw new CustomError('у меня нет права управлять ролями!');
    }

    if (args.length === 0 || !isNaN(parseInt(args[0], 10))) {
      const rrOnServer = await ReactionRoles.getServer(message.guild.id);
      if (!rrOnServer?.length) {
        throw new CustomError(
          `ничего, нигде, никогда не выдаётся. Начать выдавать: \`${this.aliases[0]} ${this.usage}\``
        );
      }

      const oneColor = parseInt(randomHexColor().slice(1), 10);
      // Удаление выдачи
      if (args.length !== 0) {
        for (const num of [...new Set(args)]) {
          const parsed = parseInt(num, 10);
          if (isNaN(parsed)) throw new CustomError('необходимо указать номер!');
          const n = parsed - 1;
          if (n < 0 || n > rrOnServer.length)
            throw new CustomError('выход за пределы списка!');
          await ReactionRoles.remove(
            rrOnServer[n].serverId,
            rrOnServer[n].channelId,
            rrOnServer[n].messageId,
            rrOnServer[n].emoji
          );
          message.reply({
            embed: {
              title: `${this.description} - удалено!`,
              description:
                `${n + 1}. <#${rrOnServer[n].channelId}> [№${
                  rrOnServer[n].messageId
                }](https://discordapp.com/channels/${rrOnServer[n].serverId}/${
                  rrOnServer[n].channelId
                }/${rrOnServer[n].messageId}):\n` +
                `<@&${rrOnServer[n].roleId}> - ${
                  isNaN(parseInt(rrOnServer[n].emoji, 10))
                    ? rrOnServer[n].emoji
                    : message.guild.roles.get(rrOnServer[n].emoji)?.name
                }`,
              color: oneColor,
            },
          });
        }
        return;
      }
      // Существующие выдачи
      message.reply({
        embed: {
          title: this.description,
          description: `Если укажете \`${this.aliases[0]} 1 3 4\` - будут удалены выдачи под номерами: 1,3,4`,
          color: oneColor,
        },
      });
      for (let i = 0; i < rrOnServer.length; i += 1) {
        message.channel.send({
          embed: {
            description: (
              `${i + 1}. <#${rrOnServer[i].channelId}> [№${
                rrOnServer[i].messageId
              }](https://discordapp.com/channels/${rrOnServer[i].serverId}/${
                rrOnServer[i].channelId
              }/${rrOnServer[i].messageId}):\n` +
              `<@&${rrOnServer[i].roleId}> - ${
                isNaN(parseInt(rrOnServer[i].emoji, 10))
                  ? rrOnServer[i].emoji
                  : message.guild.roles.get(rrOnServer[i].emoji)?.name
              }`
            ).slice(0, 1300),
            color: oneColor,
          },
        });
      }
      return;
    }

    const channel = message.mentions.channels.first(); // Канал сообщения
    if (!channel) {
      throw new CustomError(
        `канал не найден или не указан, должно быть так: \`${this.aliases[0]} ${this.usage}\``
      );
    }
    if (!message.member.hasPermission(this.permissions[1])) {
      throw new CustomError(`мне нужно право добавлять реакции в ${channel}!`);
    }

    if (args.length !== 2 + message.mentions.roles.size * 2) {
      throw new CustomError(
        `недостаточно параметров или их много, должно быть так: \`${this.aliases[0]} ${this.usage}\``
      );
    }

    const messageId = args[1]; // ID сообщения для ловли
    const messageFetch = await channel
      .fetchMessage(messageId)
      .catch(() => null);
    if (!messageFetch) {
      throw new CustomError(
        `сообщение \`${messageId}\` не найдено в канале ${channel}!`
      );
    }
    // Создание выдачи
    const compliance: string[] = [];
    const roles = message.mentions.roles.map(role => role);
    for (let i = 0; i < message.mentions.roles.size; i += 1) {
      const role = roles[i];
      const reaction = args[(i + 1) * 2]; // Реакция-эмодзи
      compliance.push(`${role} - ${reaction}`);
      if (!reaction.startsWith('<')) {
        if ((await messageFetch.react(reaction).catch(() => null)) === null)
          continue;
        await ReactionRoles.set(
          message.guild.id,
          channel.id,
          messageId,
          reaction,
          role.id
        );
      } else {
        const reactionId = reaction.slice(
          reaction.lastIndexOf(':') + 1,
          reaction.length - 1
        );
        if ((await messageFetch.react(reactionId).catch(() => null)) === null)
          continue;
        await ReactionRoles.set(
          message.guild.id,
          channel.id,
          messageId,
          reactionId,
          role.id
        );
      }
    }

    message.reply({
      embed: {
        title: this.description,
        description:
          `У сообщения [№${messageId}](${messageFetch.url}):\n` +
          compliance.join('\n').slice(0, 1300),
        color: parseInt(randomHexColor().slice(1), 10),
      },
    });
  },
};
