const shop = require('../../modules/shop.js');
const economy = require('../../modules/economy.js');
const Discord = require('discord.js');


//просмотреть или взять роль cat [номер]
//при попытке взять роль которая есть, она снимется
//если роль была в каталоге и ее удалили с сервера , она удалится из БДшки в момент вызова этой штуки

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ралей',
  aliases: ['роля'],
  usage: undefined,
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute( message, args) {

    var r_num = parseInt(args[ 0]);

    const list = await shop.getall(message.guild.id);
    if (!list.length) {
      return message.reply('Кажется каталог пустой');
    }
    var embed = new Discord.RichEmbed();
    var msg = ``;

    if (isNaN(r_num)) {

      embed.setTitle(`Каталог`);
      var p = 0;

      for (const list_pos of list) {
        try{
          console.log( [list_pos.roleId, list_pos.roleCost]);
          var _r = message.guild.roles.get( list_pos.roleId);
          let _price = (list_pos.roleCost>0) ? `**${list_pos.roleCost}** деняк\n` : `**бесплатно**\n`;
          msg += p++ + `: **${ _r.name}** за ` + _price; 
        } catch {
          shop.del( message.guild.id, list_pos.roleId);
        }

      }
    } else {
      try {
        var _r = message.guild.roles.get( list[ r_num].roleId);
        var _r_cost = list[r_num].roleCost;

        const _balance = await economy.get( message.guild.id, message.author.id);

        msg += `ты пытешься взять роль **${ _r.name}** за `;
        
        if(!_r_cost) {
          msg += `**бесплатно** `;
        } else {
          msg += `**${_r_cost}** `;
        }

        if (!message.member.roles.has( _r.id)) {
          if ( _balance >= _r_cost) {
            message.member.addRole( _r);
            await economy.set(message.guild.id, message.author.id, -_r_cost);
            msg += `и ты ее успешно приобрел`;
          } 
        } else {
            message.member.removeRole( _r);
            msg = `ты снял роль **${ _r.name}**`;
        }

      } catch {
        msg += `Кажется такой роли нет или ты деалешь что-то не то`;
      }
    }
    embed.setDescription(msg);
    message.channel.send( embed);
  },
};
