import * as Discord from 'discord.js';
import * as tools from '../../modules/tools';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Поделиться печеньем',
  aliases: ['share', 'give', 'pay'],
  usage: '<@кому> <сколько>',
  guild: true,
  hide: false,
  cooldown: 6,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(
    message: Discord.Message,
    args: string[] /* , CooldownReset */
  ) {
    // todo: pay or gift or give?
    if (!(message.mentions.users.size && args[0].length)) {
      return message.reply('вы никого не упомянули.');
    }

    const amount = parseInt(args[1], 10);
    if (!amount) {
      return message.reply(
        'вы не указали количество печенья, которое хотите передать.'
      );
    }
    if (amount <= 0) {
      return message.reply(
        'количество передаваемого печенья не может быть отрицательным или равно нулю!'
      );
    }

    const currency = await economy.get(message.guild.id, message.author.id);
    if (!currency) {
      return message.reply('вам нечего передавать!');
    }
    if (currency < amount) {
      return message.reply('не хватает!');
    }

    const victim = message.mentions.members.first();
    if (message.author.id === victim.id) {
      economy.set(message.guild.id, message.author.id, -amount);
      message.reply(
        'я съела печенье, которое вы хотели передать самому себе ... оно ведь вам было не нужно?'
      );
    } else {
      await economy.transaction(
        message.guild.id,
        message.author.id,
        victim.id,
        amount
      );
      message.reply(
        `вы передали ${victim} ${tools.separateThousandth(
          amount.toString()
        )}:cookie:`
      );
    }
  },
};
