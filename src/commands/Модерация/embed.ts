import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import axios from 'axios';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Отправить embed-сообщение',
  aliases: undefined,
  usage: '<#канал> <{title: ...} || message.txt>',
  guild: true,
  hide: true,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (message.mentions.channels.size === 0) {
      throw new CustomError(
        `в начале необходимо указать канал куда нужно отправить сообщение!`
      );
    }

    if (!message.mentions.channels.first().permissionsFor(message.author)!.has(this.permissions)) {
      throw new CustomError('у тебя нет прав управлять/отправлять сообщения в указанный канал!');
    }

    let embed = null;

    try {
      if (message.attachments.size !== 0) {
        const response = await axios.get(message.attachments.first().url);
        embed = response.data;
      } else {
        if (args.slice(1).length !== 0) {
          embed = JSON.parse(args.slice(1).join(' '));
        }
      }
    } catch (err) {
      message.reply(`\`\`\`xl\n${err}\n\`\`\``);
    }

    if (!embed) {
      throw new CustomError(
        `необходимо прикрепить код (message.txt как предлагает дискорд) или указать embed после канала: { title: ...}`
      );
    }

    try {
      return message.mentions.channels.first().send({ embed });
    } catch (err) {
      message.reply(`\`\`\`xl\n${err}\n\`\`\``);
    }
  }
};
