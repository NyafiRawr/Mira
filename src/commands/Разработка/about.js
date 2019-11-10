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
    const embed = new Discord.RichEmbed()
      .setAuthor('Информация обо мне', 'https://i.imgur.com/wSTFkRM.png')
      .setURL('https://discord.js.org')

      .addField('Обновление', packageFile.version, true)
      .addField('Префикс', config.bot.prefix, true)
      .addField('Разработчик', packageFile.author, true)

      .setColor(tools.randomHexColor());

    if (message.guild !== null) {
      embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);
    }

    message.channel.send({ embed });
  },
};
