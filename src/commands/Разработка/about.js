import Discord from 'discord.js';
import config from '../../config';
import * as tools from '../../modules/tools';

const packageFile = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: `Информация о ${packageFile.name}`,
  aliases: ['info', 'version', 'developer'],
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message /* , args, CooldownReset */) {
    let totalSeconds = (message.client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    const uptime = `${days} д ${hours} ч ${minutes} м ${seconds} с`;

    const embed = new Discord.RichEmbed()
      .setAuthor('Информация обо мне', 'https://i.imgur.com/wSTFkRM.png')
      .setTitle(`Работаю на Discord.JS (NodeJS ${process.version})`)
      .setURL('https://discord.js.org')

      .addField('Обновление', packageFile.version, true)
      .addField('Время работы', uptime, true)
      .addField('Разработчик', packageFile.author.tag, true)
      .addField('Префикс', config.bot.prefix, true)
      .addField('Сервера', message.client.guilds.size, true)
      .addField('Пользователи', message.client.users.size, true)

      .setColor(tools.randomHexColor());

    if (message.guild !== null) {
      embed.setFooter(tools.embedFooter(message, this.name), message.author.displayAvatarURL);
    }

    message.channel.send({ embed });
  },
};
