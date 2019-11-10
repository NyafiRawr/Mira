let osu = require('../../modules/osu.js');
let cache = require('../../bot.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Запомнить ваш ник в osu!',
  aliases: ['nickname', 'osunick', 'setosu', 'setnickname', 'setnick', 'setosunickname', 'setosunick', 'gamenick', 'nick'],
  usage: '<ник>',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args, CooldownReset) {
    if (!args.length) {
      return message.reply('вы не указали ник, который нужно сохранить.');
    };

    cache.setPlayer(message.guild.id, message.author.id, { 'nick': args.join(' ') });

    message.reply(`сохраненный никнейм: **${args.join(' ')}**`);
  },
};
