import * as Discord from 'discord.js';
import * as tools from '../../utils/tools';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выполнить код',
  aliases: undefined,
  usage: '<код>',
  guild: false,
  hide: true,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message, args: string[] /* , CooldownReset */) {
    if (message.author.id !== packageJson.author.id) {
      return message.reply(
        `команда ${this.name} доступна только разработчику!`
      );
    }

    if (args[0] === undefined) {
      return message.reply('не указан код для выполнения.');
    }

    try {
      const code = args.join(' ');
      // tslint:disable-next-line
      eval(code);
    } catch (err) {
      message.channel.send(`\`\`\`xl\n${err}\n\`\`\``);
    }
  },
};
