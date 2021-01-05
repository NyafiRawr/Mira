import { Message } from 'discord.js';
import { separateThousandth } from '../../utils';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Забрать печенье',
  usage: '<@у_кого @ ...> <сколько>',
  cooldown: {
    seconds: 0.5,
  },
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (!message.member!.hasPermission(this.permissions[0])) {
      throw new Error(
        `нужно иметь глобальную привилегию: ${this.permissions[0]}.`
      );
    }

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

    members.map((member) => {
      economy.setBalance(message.guild!.id, member.id, -amount);
    });

    message.reply(
      `ты выдал ${members.array().join(', ')}` +
        ` ${separateThousandth(amount.toString())}:cookie:`
    );
  },
};
