import { Message } from 'discord.js';
import * as users from '../../modules/users';
import * as economy from '../../modules/economy';
import { separateThousandth } from '../../utils';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Передать печенье',
  aliases: ['pay', 'gift'],
  usage: '<@кому @ ...> <сколько>',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (!message.mentions.members?.size) {
      throw new Error('ты никого не упомянул.');
    }

    const members = message.mentions.members;

    const amount = parseInt(args[members.size], 10);
    if (Number.isInteger(amount) == false || amount < 1) {
      throw new Error(
        'ты не указал количество, оно должно быть целочисленным и положительным.'
      );
    }
    const user = await users.get(message.guild!.id, message.author.id);
    if (user.balance < amount * message.mentions.members.size) {
      throw new Error('не хватает.');
    }

    if (members.has(message.author.id)) {
      throw new Error(
        'передача печенек самому себе запрещена печеньковым кодексом!'
      );
    }

    members.map((member) => {
      economy.payTransaction(
        message.guild!.id,
        message.author.id,
        member.id,
        amount
      );
    });

    message.reply(
      `ты передал ${members.array().join(', ')} ${separateThousandth(
        amount.toString()
      )}:cookie:`
    );
  },
};
