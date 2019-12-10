const Discord = require('discord.js');
const shop = require('../../modules/shop.js');

//удалить роль из каталога cat_del @роль

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Добавление роли в каталог',
  aliases: ['роля'],
  usage: undefined,
  guild: true,
  hide: false,
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute( message, args) {

    var role_id = args[ 0];
    role_id = role_id.toString(role_id);
    role_id = role_id.replace("<@&","").replace(">","");

    try {
      var _role = message.guild.roles.get( role_id);
      var _id = _role.id;
      await shop.del(message.guild.id, _id);
    } catch {
      return message.reply('Ты суешь мне какую-то дичь');
    }

    const replyMessage = `роль **${_role.name}** удалена из каталога, если она там была конечно`;
    const embed = new Discord.RichEmbed()
      .setDescription( replyMessage);
    message.channel.send(embed);
  },
};

