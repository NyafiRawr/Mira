import * as Discord from 'discord.js';
import { randomInteger } from '../../utils/tools';
import CustomError from '../../utils/customError';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Бросить кости',
  aliases: undefined,
  usage: '[максимальное число]', // TODO: '[максимальное число]/[начало-конец]'
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message, args: string[]) {
    let limit = 100;

    if (args[0]) {
      limit = parseInt(args[0], 10);
      if (!Number.isInteger(limit)) throw new CustomError('только целые числа.');
    }

    message.reply(
      `вы бросаете кости и выпадает **||${randomInteger(0, limit)}|| из ${limit}!**`
    );
  },
};
