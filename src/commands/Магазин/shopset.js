const Discord = require('discord.js');
const shop = require('../../modules/shop.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Добавить роль',
  aliases: undefined,
  usage: undefined,
  guild: true,
  hide: false,
  permissions: ['MANAGE_ROLES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args) {
    // todo: добавить возможность добавлять не пингуемые роли?
    const role = message.mentions.roles.first();
    const cost = parseInt(args[1], 10) || 0;

    await shop.set(message.guild.id, role.id, cost);

    const embed = new Discord.RichEmbed()
      .setDescription(`Роль **${role}** выставлена за **${cost}**:cookie:`);
    embed.setFooter(tools.embedFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send(embed);
  },
};
