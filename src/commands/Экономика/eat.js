import { randomInteger } from '../../modules/tools';

const economy = require('../../modules/economy.js');

const effects = [
  'ура! Вы стали на newWeight кг жирней! (totalWeight кг)',
  'вы чувствуете переполняющую решимость от +newWeight кг печенья (totalWeight кг)',
];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Съесть печенье',
  aliases: undefined,
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 30,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args, CooldownReset) {
    const currency = await economy.get(message.guild.id, message.author.id);

    if (!currency) {
      return message.reply('у вас нет печенья, чтобы его съедать!');
    } if (currency < 1) {
      return message.reply('есть нечего.');
    }

    const amount = Math.abs(args[0] || 1);
    if (Number.isNaN(amount) || amount < 1) {
      CooldownReset();
      return message.reply(`:boom: \`-help ${this.name}\`?`);
    } if (amount > currency) {
      CooldownReset();
      return message.reply('вы трёте глаза и осознаёте, что у вас гораздо меньше печенья, чем вы думали...');
    }

    const newWeight = amount / 100;
    await economy.set(message.guild.id, message.author.id, -amount);
    await economy.setWeight(message.guild.id, message.author.id, newWeight);
    const totalWeight = await economy.getWeight(message.guild.id, message.author.id);

    message.reply(effects[randomInteger(0, effects.length - 1)].replace('newWeight', newWeight).replace('totalWeight', totalWeight));
  },
};
