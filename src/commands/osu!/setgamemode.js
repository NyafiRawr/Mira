const osu = require('../../modules/osu.js');
const cache = require('../../bot.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Выбрать игровой режим',
  aliases: ['setmode', 'osumode', 'gamemode', 'mode'],
  usage: '<режим>',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args, CooldownReset) {
    if (!args.length) {
      return message.reply('вы не указали основной играемый режим, который нужно запомнить.');
    }

    const mode = osu.getKeyFromSearchOnValueFromJson('mode', args.join(' '));

    if (!mode.searchResult) {
      return message.reply(mode.result);
    }

    cache.setPlayer(message.guild.id, message.author.id, { mode: mode.result });

    message.reply(`выбранный режим: **${osu.getValueOnKeyFromJson('mode', mode.result)}**`);
  },
};
