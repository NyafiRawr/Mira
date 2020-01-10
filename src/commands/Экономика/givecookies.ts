import * as Discord from 'discord.js';
import * as tools from '../../modules/tools';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выдать печенье',
  aliases: ['gco'],
  usage: '<@кому, @, ...> <сколько>',
  guild: true,
  hide: false,
  cooldown: 0.5,
  cooldownMessage: undefined,
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      return message.reply('недостаточно привилегий!');
    }

    if (!message.mentions.members.size) {
      return message.reply('вы никого не упомянули.');
    }

    const victims = new Set(message.mentions.members.map(member => member));

    let amount = parseInt(args[message.mentions.members.size], 10);
    if (!amount) {
      return message.reply(
        'вы не указали количество печенья, которое нужно выдать.'
      );
    }
    if (amount <= 0) {
      return message.reply(
        'количество выдаваемого печенья не может быть отрицательным или равно нулю!'
      );
    }
    if (amount > 1000000000000) {
      amount = 1000000000000;
    }

    victims.forEach(member => economy.set(message.guild.id, member.id, amount));

    message.reply(
      `вы выдали ${Array.from(victims).join(', ')} ${tools.separateThousandth(
        amount.toString()
      )}:cookie:`
    );
  },
};
