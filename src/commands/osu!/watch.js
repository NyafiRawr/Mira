let Discord = require('discord.js')
let osu = require('../../modules/osu.js');
let tools = require('../../modules/tools.js');
let config = require('../../config.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Ссылка для наблюдения',
  aliases: ['w', 'spectate'],
  usage: '[@ или ник]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args, CooldownReset) {
    let { nick, mode, server } = await osu.searchPlayer(message, args);

    let embed = new Discord.RichEmbed()
      .setAuthor('Ссылка для наблюдения')
      .setTitle(`<osu://spectate/${nick}>`)

    let osuUser = osu.get_user(nick, null, server);
    if (!(!osuUser || !osuUser.length)) {
      let links = osu.getValueOnKeyFromJson('links', server);
      embed.setImage(links['avatar'].replace('ID', osuUser[0].user_id));
    };

    embed.setColor(tools.randomHexColor());

    let requestMember = message.guild.members.get(message.author.id);
    embed.setFooter(`Запрос от ${requestMember['nickname'] ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`}`, message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
