const Discord = require('discord.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Информация о сервере',
  aliases: ['infoserver', 'aboutserver'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message /* , args, CooldownReset */) {
    const botCount = message.guild.members.filter((b) => b.user.bot).size;


    const embed = new Discord.RichEmbed()
      .setAuthor(`${message.guild.name} (${tools.toDate(message.guild.createdAt)})`, message.guild.iconURL)

      .addField('Местный тиран', message.guild.owner, true)
      .addField('Уровень проверки', tools.getValueOnKeyFromJson('verificationLevel', message.guild.verificationLevel), true)
      .addField('Местонахождение', `:flag_${message.guild.region.substr(0, 2)}:`, true)

      .addField('Люди', message.guild.memberCount - botCount, true)
      .addField('Боты', botCount, true)
      .addField('Каналы', message.guild.channels.size, true)

      .addField(`Роли (${message.guild.roles.size - 1})`, message.guild.roles.map((r) => r.toString()).slice(1, 24).join(' ') || 'Нет', false)
      .addField(`Эмодзи (${message.guild.emojis.size})`, message.guild.emojis.map((e) => e.toString()).slice(1, 24).join(' ') || 'Нет', false)

      .setColor(tools.randomHexColor());

    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
