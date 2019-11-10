import * as tools from '../../modules/tools';

const Discord = require('discord.js');
const packageFile = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Пригласить на свой сервер',
  aliases: undefined,
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message /* , args, CooldownReset */) {
    const embed = new Discord.RichEmbed()
      .setAuthor('Спасибо за интерес!')
      .setTitle('Исходный код на GitHub-е')
      .setURL(`https://github.com/${packageFile.author.split('#')[0]}/${packageFile.name}`)
      .setDescription('К сожалению, бот недоступен для приглашений из-за того, что находится в режиме активной разработки и стоит на слабом сервере')
      .setColor('#99D8E9');

    message.author.send({ embed }).catch(() => {
      embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);
    });
  },
};
