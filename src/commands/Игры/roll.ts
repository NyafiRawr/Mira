import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import { randomInteger } from '../../utils';

const body = {
  color: config.colors.message,
  author: {
    name: 'Бросаю виртуальные кубики и выпадает ...',
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Бросить кубики',
  usage: '[начало-конец или максимальное число]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message, args: string[]) {
    let start = 0;
    let end = 100;

    if (args.length == 1) {
      end = parseInt(args[0], 10);
    }

    if (args.length == 2) {
      start = parseInt(args[0], 10);
      end = parseInt(args[1], 10);
    }

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error('только целые числа.');
    }

    if (start >= end) {
      throw new Error(
        `начальное значение (${start}) должно быть меньше конечного (${end}).`
      );
    }

    const embed = new MessageEmbed(body);
    message.channel.send(
      embed
        .setTitle(`||${randomInteger(start, end)}||`)
        .setDescription(`**из ${end}!**`)
    );
  },
};
