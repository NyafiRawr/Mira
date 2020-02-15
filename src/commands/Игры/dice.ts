import * as Discord from 'discord.js';
import { randomInteger } from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Бросить кубик',
  aliases: ['кубик'],
  usage: undefined,
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message /* , args, CooldownReset */) {
    message.reply(`вы бросаете кубик и выпадает **${randomInteger(1, 6)}!**`);
  },
};
