import CustomError from '../../utils/customError';
import * as emojis from '../../modules/emojis';
import * as Discord from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Роли по реакции к сообщению',
  aliases: ['rr'],
  usage: '<#канал> <id-сообщения> <реакция> <@роль>',
  guild: true,
  hide: false,
  permissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять ролями!');
    }
    if (!message.guild.me.hasPermission(this.permissions[0])) {
      throw new CustomError('у меня нет права управлять ролями!');
    }

    const channel = message.mentions.channels.first(); // Канал сообщения
    if (!channel) {
      throw new CustomError(
        `канал не найден или не указан, должно быть так: \`${this.aliases[0]} ${this.usage}\``
      );
    }
    if (!message.member.hasPermission(this.permissions[1])) {
      throw new CustomError(
        'мне нужно право добавлять реакции в указанном канале!'
      );
    }

    if (args.length !== 4) {
      throw new CustomError(
        `недостаточно параметров или их много, должно быть так: \`${this.aliases[0]} ${this.usage}\``
      );
    }

    const messageId = args[1]; // ID сообщения для ловли
    const messageFetch = await channel.fetchMessage(messageId);
    if (!messageFetch) {
      throw new CustomError(`сообщение \`${messageId}\` не найдено!`);
    }
    const reaction = args[2]; // Реакция-эмодзи
    const role = message.mentions.roles.first(); // Роль
    if (!role) {
      throw new CustomError(
        `не указана роль для выдачи: \`${this.aliases[0]} ${this.usage}\``
      );
    }

    if (!reaction.startsWith('<')) {
      await emojis.set(channel.id, messageId, reaction, role.id);
      await messageFetch.react(reaction);
    } else {
      const reactionId = reaction.slice(
        reaction.lastIndexOf(':') + 1,
        reaction.length - 1
      );
      const reactionCheck = message.guild.emojis.get(reactionId);
      if (!reactionCheck) {
        throw new CustomError(
          `серверная реакция №\`${reactionId}\` не найдена!`
        );
      }
      await emojis.set(channel.id, messageId, reactionId, role.id);
      await messageFetch.react(reactionId);
    }

    message.reply(
      `у сообщения №\`${messageId}\` ${channel} выдаётся роль \`${role.name}\` по реакции ${reaction}`
    );
  },
};
