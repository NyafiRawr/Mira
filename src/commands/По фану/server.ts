import * as Discord from 'discord.js';

import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Информация о сервере',
  aliases: ['aboutserver', 'serverinfo'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message) {
    const botCount = message.guild.members.filter(b => b.user.bot).size;
    const verificationLevel = tools.getData('verificationLevel')[
      message.guild.verificationLevel
    ];

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `${message.guild.name} (${tools.toDate(
          message.guild.createdAt.toISOString()
        )})`,
        message.guild.iconURL
      )

      .addField('Местный тиран', message.guild.owner, true)
      .addField('Уровень проверки', verificationLevel, true)
      .addField(
        'Местонахождение',
        `:flag_${message.guild.region.substr(0, 2)}:`,
        true
      )

      .addField('Люди', message.guild.memberCount - botCount, true)
      .addField('Боты', botCount, true)
      .addField('Каналы', message.guild.channels.size, true)

      .addField(
        `Роли (${message.guild.roles.size - 1})`,
        message.guild.roles
          .map(r => r.toString().trim())
          .slice(1, 24)
          .join(' ') || 'Нет',
        false
      )
      .addField(
        `Эмодзи (${message.guild.emojis.size})`,
        message.guild.emojis
          .map(e => e.toString())
          .slice(1, 24)
          .join(' ') || 'Нет',
        false
      )

      .setColor(tools.randomHexColor())

      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    message.channel.send({ embed });
  },
};
