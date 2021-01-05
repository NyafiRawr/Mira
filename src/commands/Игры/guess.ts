import { Message, MessageEmbed } from 'discord.js';
import { randomBoolean } from '../../utils';
import * as economy from '../../modules/economy';
import config from '../../config';

const awardCookies = 100;

const body = {
  color: config.colors.message,
  author: {
    name: 'Загадываю цифру ...',
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Угадай цифру',
  usage: '<цифра от 1 до 10>',
  cooldown: {
    seconds: 75600,
    messages: ['загадываю новую цифру (timeLeft)'],
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const amount = parseInt(args[0], 10);
    if (!Number.isInteger(amount) || amount < 1) {
      throw new Error(
        'ты не указал цифру, она должна быть целочисленной и положительной.'
      );
    }

    const correct = randomBoolean(); // Выше шанс угадать, чем реально загадывать цифру

    const embed = new MessageEmbed(body);
    if (correct) {
      economy.setBalance(message.guild!.id, message.author.id, awardCookies);
    }
    message.channel.send(
      embed
        .setTitle(correct ? 'ВЕРНО' : 'НЕ ПОВЕЗЛО')
        .setDescription(correct ? ':gift:' : ':negative_squared_cross_mark:')
    );
  },
};
