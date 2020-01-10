import * as Discord from 'discord.js';
import * as tools from '../../modules/tools';
import * as economy from '../../modules/economy';

const topSize = 10;
const rangs = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Печеньковые богачи',
  aliases: ['cootop'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message /* , args, CooldownReset */) {
    const base = await economy.get(message.guild.id);
    if (!base) {
      return message.reply(
        'в этом мире нет печенья... но я здесь и вместе мы сможем исправить это!'
      );
    }

    const baseCleared = new Map();
    base.forEach((user: any) => {
      const member = message.guild.members.get(user.id);
      if (!!member && !member.user.bot && user.balance > 0) {
        baseCleared.set(user.id, user.balance);
      }
    });

    const top = new Map(
      [...baseCleared.entries()].sort(
        (x, y) => baseCleared.get(x) - baseCleared.get(y)
      )
    );

    const msg: any[] = [];
    [...top.keys()].slice(0, topSize > top.size ? top.size : topSize).forEach((userId) => {
      const member = message.guild.members.get(userId);
      if (member) {
        msg.push(`  **${rangs[msg.length]}. ${(!member || !member.nickname) ? member.user.username : member.nickname}** ${tools.separateThousandth(top.get(userId))}:cookie:`);
      }
    });

    message.reply(`**печеньковые богачи:**\n${msg.join('\n')}`);
  },
};
