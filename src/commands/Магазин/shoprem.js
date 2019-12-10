const Discord = require('discord.js');
const shop = require('../../modules/shop.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Удаление роли',
  aliases: undefined,
  usage: undefined,
  guild: true,
  hide: false,
  permissions: ['MANAGE_ROLES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message) {
    const role = message.mentions.roles.first();

    await shop.remove(message.guild.id, role.id);

    const embed = new Discord.RichEmbed()
      .setDescription(`Роль **${role}** удалена из магазина`);
    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send(embed);
  },
};
