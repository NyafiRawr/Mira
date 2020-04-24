import * as Discord from 'discord.js';
import * as tools from '../../utils/tools';
import * as moment from 'moment';

const toDateLife = (value: string) => {
  const date = new Date(value);
  const difference = new Date(Date.now() - date.getTime());

  const year = moment(difference).year(difference.getFullYear() - 1970).year();
  const month = moment(difference).month();
  const day = moment(difference).day();

  let dateDifference = ' - ';
  if (year !== 0) {
    dateDifference += `${year} `;
    if (year === 1) {
      dateDifference += `год`;
    } else if (year > 1 && year < 5) {
      dateDifference += `года`;
    } else {
      dateDifference += `лет`;
    }
  }
  if (month !== 0) {
    dateDifference += ` ${month} `;
    if (month === 1) {
      dateDifference += `месяц`;
    } else if (month > 1 && month < 5) {
      dateDifference += `месяца`;
    } else {
      dateDifference += `месяцев`;
    }
  }
  if (day !== 0) {
    dateDifference += ` ${day} `;
    if (day % 10 === 1) {
      dateDifference += `день`;
    } else if (day % 10 > 1 && day % 10 < 5) {
      dateDifference += `дня`;
    } else {
      dateDifference += `дней`;
    }
  }

  return dateDifference;
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Информация о сервере',
  aliases: ['server', 'aboutserver'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message) {
    const botCount = message.guild.members.filter(b => b.user.bot).size;
    const verificationLevel = tools.getData('verificationLevels')[
      message.guild.verificationLevel
    ];

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `${message.guild.name} (${tools.toDate(message.guild.createdAt.toISOString())}`
        + toDateLife(message.guild.createdAt.toISOString())
        + ')',
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
