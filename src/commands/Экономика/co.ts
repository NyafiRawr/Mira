import { Message } from 'discord.js';
import { separateThousandth } from '../../utils';
import * as users from '../../modules/users';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Баланс печенек',
  aliases: ['coo', 'cookies', 'balance', 'money', 'credits'],
  usage: '[@]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message) {
    if (message.mentions.members?.size && message.mentions.members.size > 1) {
      throw new Error(
        'за одну команду можно узнать количество печенья только одного человека.'
      );
    }

    const victim = message.mentions.members?.size
      ? message.mentions.members.first()
      : message.member;
    if (victim == null) {
      throw new Error('участник не найден.');
    }

    let msg = 'у ';

    if (message.author.id == victim.id) {
      msg += `тебя`;
    } else {
      msg += victim.displayName;
    }

    const currency = (await users.get(message.guild!.id, victim!.id)).balance;
    if (currency == 0) {
      msg += ' совсем-совсем нет печенья!\n';
    } else {
      msg += ` ${separateThousandth(currency.toString())}:cookie:\n`;
    }

    message.reply(msg);
  },
};
