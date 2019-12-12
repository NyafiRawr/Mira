import { randomInteger } from '../../modules/tools';

const economy = require('../../modules/economy.js');

const effects = [
  'вы стали жирней на одну печеньку',
  'вы съели печеньку и чувствуете переполняющую решимость.',
];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Съесть печенье',
  aliases: undefined,
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    const currency = await economy.get(message.guild.id, message.author.id);

    if (!currency) {
      return message.reply('у вас нет печенья, чтобы его съедать!');
    } if (currency < 1) {
      return message.reply('есть нечего.');
    }

    economy.set(message.guild.id, message.author.id, -1);

    message.reply(effects[randomInteger(0, effects.length - 1)]);
  },
};
