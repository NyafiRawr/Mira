import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as tools from '../../utils/tools';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Забрать печенье',
  aliases: ['rco'],
  usage: '<@у кого> <сколько>',
  guild: true,
  hide: false,
  cooldown: 0.5,
  cooldownMessage: undefined,
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('недостаточно привилегий!');
    }

    if (!(message.mentions.users.size && args[0].length)) {
      throw new CustomError('вы никого не упомянули.');
    }

    let amount = parseInt(args[1], 10);
    if (!amount) {
      throw new CustomError(
        'вы не указали количество печенья, которое нужно забрать.'
      );
    }
    if (amount <= 0) {
      throw new CustomError(
        'количество забираемого печенья не может быть отрицательным или равно нулю!'
      );
    }
    if (amount > 1000000000000) {
      amount = 1000000000000;
    }

    const victim = message.mentions.users.first();

    await economy.set(message.guild.id, victim.id, -amount);

    message.reply(
      `у пользователя ${victim} конфисковано ${tools.separateThousandth(
        amount.toString()
      )}:cookie:`
    );
  },
};
