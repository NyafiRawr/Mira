const osu = require('../../modules/osu.js');
const cache = require('../../bot.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Указать игровой сервер',
  aliases: ['osuserver', 'setserver', 'gameserver', 'server'],
  usage: '<сервер>',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args, CooldownReset) {
    if (!args.length) {
      return message.reply('вы не указали сервер, который нужно использовать.');
    }

    const server = osu.getKeyFromSearchOnValueFromJson('server', args.join(' '));
    if (!server.searchResult) {
      return message.reply(server.result);
    }

    cache.setPlayer(message.guild.id, message.author.id, { server: server.result });

    message.reply(`используемый сервер: **${osu.getValueOnKeyFromJson('server', server.result)}**`);
  },
};
