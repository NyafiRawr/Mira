import { Message } from 'discord.js';
import axios from 'axios';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Отправить embed-сообщение',
  usage: `<#канал> <код или файл с кодом из https://leovoel.github.io/embed-visualizer>`,
  permissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (message.mentions.channels?.first() === undefined) {
      throw new Error(
        `в начале необходимо указать канал куда нужно отправить сообщение!`
      );
    }

    if (
      !message.mentions.channels
        ?.first()
        ?.permissionsFor(message.author)
        ?.has(this.permissions)
    ) {
      throw new Error(
        'у тебя нет прав управлять/отправлять сообщения в указанный канал!'
      );
    }

    let embed = null;

    try {
      if (message.attachments.size !== 0) {
        const response = await axios.get(
          message.attachments?.first()?.url || ''
        );
        if (!response?.data) {
          throw new Error(
            'код для вставки не найден - прикрепленный файл пуст.'
          );
        }
        embed = response.data;
      } else {
        const code = args.slice(1);
        if (code.length == 0) {
          throw new Error('не указан код для вставки, проверь параметры.');
        }
        embed = JSON.parse(code.join(' '));
      }
    } catch (err) {
      message.reply(
        `при чтении кода произошла ошибка: \`\`\`xl\n${err}\n\`\`\``
      );
    }

    try {
      message.mentions.channels.first()?.send(embed);
    } catch (err) {
      message.reply(`не удалось отправить сообщение: \`\`\`xl\n${err}\n\`\`\``);
    }
  },
};
