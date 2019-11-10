const packageFile = require('../../../package.json');


module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выполнить код',
  aliases: ['developer'],
  usage: '<код>',
  guild: false,
  hide: true,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args /* , CooldownReset */) {
    if (message.author.tag !== packageFile.author) {
      return message.reply(`команда ${this.name} доступна только разработчику!`);
    }

    if (args[0] === undefined) {
      return message.reply('не указан код для выполнения.');
    }

    try {
      const code = args.join(' ');
      // eslint-disable-next-line no-eval
      eval(code);
    } catch (err) {
      message.channel.send(`\`\`\`xl\n${err}\n\`\`\``);
    }
  },
};
