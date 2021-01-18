import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import { randomInteger, randomBoolean } from '../../utils';
import * as economy from '../../modules/economy';

const body = {
  color: config.colors.alert,
  author: {
    name: 'Слот-машина',
  },
};

const means = ['🍔', '🍕', '🍜', '🍟', '🍰'];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Слот-машина, совпадения и удача :cookie:',
  aliases: ['slots'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    // Ставка
    const amount = parseInt(args.join(), 10);
    if (Number.isInteger(amount) === false || amount < 1) {
      throw new Error(
        'не указана ставка, она должна быть целочисленной и положительной.'
      );
    }

    // Запускаем слот-машину
    const a = randomInteger(0, means.length - 1);
    const b = randomInteger(0, means.length - 1);
    const c = randomInteger(0, means.length - 1);

    const embed = new MessageEmbed(body);

    let bonusText = 'Без бонусов';
    const lucky = randomBoolean();
    if (lucky) {
      bonusText = 'Выпал бонус: Удача!';
    }

    let award = amount;
    // Комбинации
    if (a == b && b == c) {
      if (lucky) {
        award *= 4;
        embed
          .setTitle('Успех!')
          .setDescription('Ставка умножена в 4 раза!')
          .addField(bonusText, `Получено: ${award}:cookie:`);
      } else {
        award *= 3;
        embed
          .setTitle('Поздравляю!')
          .setDescription('Ставка умножена в 3 раза!')
          .addField(bonusText, `Получено: ${award}:cookie:`);
      }
    } else if (a == b || b == c || a == c) {
      embed.setTitle('Почти получилось!');
      if (lucky) {
        award *= 2;
        embed
          .setDescription('Но ставка не потеряна и умножена в 2 раза! ')
          .addField(bonusText, `Получено: ${award}:cookie:`);
      } else {
        award = Math.round(award / 2);
        embed
          .setDescription('Отнята часть ставки')
          .addField(bonusText, `Потеряно: ${award}:cookie:`);
        award = -award;
      }
    } else {
      embed.setTitle('Не повезло'!);
      if (lucky) {
        award = 1;
        embed
          .setDescription('Из-за бонуса ты ничего не потерял! ')
          .addField(bonusText, 'Держи печеньку!');
      } else {
        embed
          .setDescription('Ничего совпадающего не выпало')
          .addField(bonusText, `Потеряно: ${award}:cookie:`);
        award = -award;
      }
    }

    await economy.setBalance(message.guild!.id, message.author.id, award);

    message.channel.send(`${means[a]}${means[b]}${means[c]}`, embed);
  },
};
