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
  execute(message, args /* , CooldownReset */) {
    let limit = 100;

    if (args[0]) {
      limit = parseInt(args[0], 10);
      if (Number.isNaN(limit)) {
        return message.reply('только целые числа.');
      } if (limit < 2) {
        return message.reply('а где неопределенность?');
      }
    }

    message.reply(`вы бросаете кости и выпадает **${randomInteger(0, limit)} из ${limit}!**`);
  },
};
