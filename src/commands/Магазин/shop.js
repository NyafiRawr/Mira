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
        msg += `${i + 1}. ${message.guild.roles.get(roles[i].roleId)} ${roles[i].cost}:cookie:`;
      }
    } else {
      const roleMention = message.mentions.roles.first();
      const roleShop = await shop.get(message.guild.id, roleMention.id);
      console.log(roleShop);
      if (roleShop) {
        return message.reply('такой роли в продаже нет.');
      }
      // todo: добавить инвентарь (снятие/надевание ролей)
      if (message.guild.member(message.author.id).roles.has(roleMention.id)) {
        return message.reply('у вас уже есть эта роль!');
      }

      if (roleShop.cost > 0) {
        const balance = await economy.get(message.guild.id, message.author.id);
        if (balance < roleShop.cost) {
          return message.reply('не хватает!');
        }
        await economy.set(message.guild.id, message.author.id, -roleShop.cost);
      }
      message.member.addRole(roleMention);

      msg += `Вы купили роль ${roleMention} за ${roleShop.cost}:cookie:`;
    }

    embed.setDescription(msg);
    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send(embed);
  },
};
