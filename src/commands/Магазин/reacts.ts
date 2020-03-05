import CustomError from '../../utils/customError';
import * as emojis from '../../modules/emojis';
import * as Discord from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Роли по реакции к сообщению',
  aliases: ['rr'],
  usage: '<id-сообщения> <реакция> <@роль>',
  guild: true,
  hide: false,
  permissions: ['MANAGE_ROLES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять ролями!');
    }

    if (args.length !== 3 || args.length > 3) {
      throw new CustomError(
        `недостаточно параметров или их много, должно быть так: \`${this.aliases[0]} ${this.usage}\``
      );
    }

    const messageId = args[0]; // Сообщение для ловли
    const messageFetch = await message.channel.fetchMessage(messageId);
    if (!messageFetch) {
      throw new CustomError(
        `сообщение \`${messageId}\` не найдено!`
      );
    }
    const reaction = args[1]; // Реакция-эмодзи
    const role = message.mentions.roles.first(); // Роль
    if (!role) {
      throw new CustomError(
        `не указана роль для выдачи: \`${this.aliases[0]} ${this.usage}\``
      );
    }

    if (!reaction.startsWith('<')) {
      const reactionCheck = message.client.emojis.find(emoji => emoji.name === reaction);
      if (!reactionCheck) {
        throw new CustomError(
          `реакция \`${reaction}\` не найдена!`
        );
      }
      emojis.set(message.channel.id, messageId, reaction, role.id);
      messageFetch.react(reaction);
    } else {
      const reactionId = reaction.slice(reaction.lastIndexOf(':') + 1, reaction.length - 1);
      const reactionCheck = message.guild.emojis.find(emoji => emoji.id === reactionId);
      if (!reactionCheck) {
        throw new CustomError(
          `реакция №\`${reactionId}\` не найдена!`
        );
      }
      emojis.set(message.channel.id, messageId, reactionId, role.id);
      messageFetch.react(reactionId);
    }

    message.reply(
      `у сообщения №\`${messageId}\` выдаётся роль \`${role.name}\` по реакции ${reaction}`
    );
  },
};
