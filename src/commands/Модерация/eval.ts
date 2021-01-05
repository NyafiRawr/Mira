import { Message } from 'discord.js';
import config from '../../config';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выполнить код (разработчик)',
  usage: '<код>',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message, args: string[]) {
    if (message.author.id != config.author.discord.id) {
      message.reply(`команда ${this.name} доступна только разработчику!`);
      return;
    }

    if (args.length == 0) {
      message.reply('не указан код для выполнения.');
      return;
    }

    try {
      eval(args.join(' '));
    } catch (err) {
      message.channel.send(`\`\`\`xl\n${err}\n\`\`\``);
    }
  },
};
