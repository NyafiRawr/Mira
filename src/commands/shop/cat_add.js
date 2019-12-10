const Discord = require('discord.js');
const shop = require('../../modules/shop.js');

//добавить роль в каталог cat_add @роль стоимость(опционально, отсутсвие = 0)
//            так же при помощи этой штуки менется стимость роль

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

    let role_id = args[ 0];
    let role_cost = parseInt(args[ 1]);
    role_id = role_id.toString(role_id);
    role_id = role_id.replace("<@&","").replace(">","");

    if (isNaN( role_cost)) 
      role_cost = 0;
      
    try {
      let _role = message.guild.roles.get( role_id);
      let _id = _role.id;
      console.log( [ role_id, role_cost, _id]);
    } catch {
      return message.reply('Ты суешь мне какую-то дичь');
    }
    
    await shop.set(message.guild.id, role_id, role_cost);

    const replyMessage = `роль ${args[ 0]} добавлена в каталог за ${role_cost} деняк`;
    const embed = new Discord.RichEmbed()
      .setDescription( replyMessage);
    message.channel.send(embed);
  },
};

