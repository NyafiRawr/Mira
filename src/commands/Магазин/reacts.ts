import CustomError from '../../utils/customError';
import * as emojis from '../../modules/emojis';
import * as Discord from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Роли по реакции к сообщению',
  aliases: ['rr'],
  usage: '<@роль> <реакция> <id-сообщения>',
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

    const role = message.mentions.roles.first(); // Роль
    if (!role) {
      throw new CustomError(
        `не указана роль для выдачи: \`${this.aliases[0]} ${this.usage}\``
      );
    }
    const reaction = args[1]; // Реакция-эмодзи
    const messageId = args[2]; // Сообщение для ловли
    const messageFetch = await message.channel.fetchMessage(messageId);
    if (!messageFetch) {
      throw new CustomError(
        `сообщение \`${messageId}\` не найдено!`
      );
    }

    emojis.set(message.channel.id, messageId, reaction, role.id);
    messageFetch.react(reaction);

    message.channel.send(
      `у сообщения №\`${messageId}\` выдаётся роль \`${role.name}\` по реакции \`${reaction}\``
    );
  },
};
