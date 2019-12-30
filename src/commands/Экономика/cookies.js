import { separateThousandth } from '../../modules/tools';

const economy = require('../../modules/economy.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Баланс печенек',
  aliases: ['co', 'points', 'money', 'credits'],
  usage: '[@упоминания]',
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    let victims = new Set(message.mentions.members.map((member) => member));
    if (victims.size === 0) {
      victims = [message.author];
    }

    let msg = '';
    // eslint-disable-next-line no-restricted-syntax
    for await (const member of victims) {
      const currency = await economy.get(message.guild.id, member.id);
      msg += `у ${message.author.id === member.id ? 'вас' : member} `;
      if (!currency) {
        msg += 'совсем-совсем нет печенья!\n';
      } else {
        msg += `${separateThousandth(currency)}:cookie:\n`;
      }
    }

    message.reply(msg);
  },
};
