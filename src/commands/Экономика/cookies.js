import { separateThousandth } from '../../modules/tools';

const economy = require('../../modules/economy.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Баланс печенек',
  aliases: ['co', 'coo', 'cook', 'points', 'money', 'credits'],
  usage: '[@упоминания]',
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    const victim = message.mentions.members.first() || message.author;
    const appeal = message.author.id === victim.id ? 'вас' : victim;
    const currency = await economy.get(message.guild.id, victim.id);

    if (!currency) {
      message.reply(`у ${appeal} совсем-совсем нет печенья!`);
    } else {
      message.reply(`у ${appeal} ${separateThousandth(currency)}:cookie:`);
    }
  },
};
