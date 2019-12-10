const Discord = require('discord.js');
const shop = require('../../modules/shop.js');
const economy = require('../../modules/economy.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ролей',
  aliases: ['buy'],
  usage: undefined,
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message) {
    // todo: добавить проверку прав у бота управлять ролями
    const roles = await shop.get(message.guild.id);
    // todo: добавить проверку наличия на сервере ролей из магазина
    if (!roles.length) {
      return message.reply('магазин пуст...');
    }

    const embed = new Discord.RichEmbed();
    let msg = '';

    if (message.mentions.roles.size === 0) {
      embed.setTitle('Магазин');
      for (let i = 0; i < roles.length; i += 1) {
        msg += `${i + 1}. ${message.guild.roles.get(roles[i].roleId)} за ${roles[i].cost}:cookie:`;
      }
    } else {
      const role = message.mentions.roles.first();
      const listRoleIds = roles.map((r) => r.roleId);
      if (!listRoleIds.includes(role.id)) {
        return message.reply('такой роли в продаже нет.');
      }
      // todo: добавить инвентарь (снятие/надевание ролей)
      if (message.guild.member(message.author.id).roles.has(role.id)) {
        return message.reply('у вас уже есть эта роль!');
      }

      // todo: переделать.
      const cost = roles.map((r) => {
        if (r.id === role.id) {
          return r.cost;
        }
      })[0] || 0;

      if (cost > 0) {
        const balance = await economy.get(message.guild.id, message.author.id);
        if (balance < cost) {
          return message.reply('не хватает!');
        }
        await economy.set(message.guild.id, message.author.id, -cost);
      }
      message.member.addRole(role);

      msg += `Вы купили роль ${role} за ${cost}:cookie:`;
    }

    embed.setDescription(msg);
    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send(embed);
  },
};
