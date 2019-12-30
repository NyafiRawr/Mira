const economy = require('../../modules/economy.js');
const tools = require('../../modules/tools.js');

const topSize = 10;

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Печеньковые богачи',
  aliases: ['cootop', 'moneytop'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    const base = await economy.get(message.guild.id);
    if (!base) {
      return message.reply('в этом мире нет печенья... но я здесь и вместе мы сможем исправить это!');
    }

    const baseCleared = new Map();
    base.forEach((user) => {
      const member = message.guild.members.get(user.id);
      if (!!member && !member.user.bot) {
        baseCleared.set(user.id, user.balance);
      }
    });

    const top = new Map([...baseCleared.entries()].sort((x, y) => baseCleared[x] - baseCleared[y]));

    const msg = [];
    const rangs = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    top.forEach((balance, userId) => {
      const member = message.guild.members.get(userId);
      if (member) {
        msg.push(`  **${rangs[msg.length]}. ${(!member || !member.nickname) ? member.user.username : member.nickname}** ${tools.separateThousandth(balance)}:cookie:`);
      }
    });

    message.reply(`**печеньковые богачи:**\n${msg.join('\n')}`);
  },
};
