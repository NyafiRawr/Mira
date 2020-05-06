import * as Discord from 'discord.js';
import config from '../../config';
import * as tools from '../../utils/tools';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: `Информация о ${tools.toTitle(packageJson.name)}`,
  aliases: ['info', 'version', 'developer'],
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message) {
    let totalSeconds = message.client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    const uptime = `${days} д ${hours} ч ${minutes} м ${seconds} с`;

    const embed = new Discord.RichEmbed()
      .setAuthor('Информация обо мне', 'https://i.imgur.com/wSTFkRM.png')
      .setTitle(
        `GitHub`
      )
      // Discord.JS (NodeJS ${process.version} и TS v${packageJson.dependencies.typescript.slice(1)})
      .setURL(`https://github.com/${packageJson.author.name}/${packageJson.name}`)

      .setDescription(
        `Разработчики:\n - ${packageJson.author.name}\n` +
        packageJson.contributors
          .map((contr: string) => ` - ${contr}`)
          .join('\n')
      )

      .addField('Версия', packageJson.version, true)
      .addField('Время работы', uptime, true)
      .addField('Хостинг', 'FirstByte.ru', true)
      .addField('Префиксы', config.bot.prefixs.join(' '), true)
      .addField('Сервера', message.client.guilds.size, true)
      .addField('Пользователи', message.client.users.size, true)

      .setColor(tools.randomHexColor());

    if (message.guild !== null) {
      embed.setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
    }

    message.channel.send({ embed });
  },
};
