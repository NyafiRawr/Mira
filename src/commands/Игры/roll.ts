import * as Discord from 'discord.js';
import { randomInteger } from '../../modules/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Бросить кости',
  aliases: ['кости'],
  usage: '[максимальное число]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message, args: string[] /* , CooldownReset */) {
    let limit = 100;

    if (args[0]) {
      limit = parseInt(args[0], 10);
      return message.reply(
        Number.isNaN(limit) ? 'только целые числа.' : 'а где неопределенность?'
      );
    }

    message.reply(
      `вы бросаете кости и выпадает **${randomInteger(0, limit)} из ${limit}!**`
    );
  },
};
