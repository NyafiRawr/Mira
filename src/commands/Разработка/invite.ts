import * as Discord from 'discord.js';
import * as tools from '../../modules/tools';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../../package.json');

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
  execute(message: Discord.Message /* , args, CooldownReset */) {
    const embed = new Discord.RichEmbed()
      .setAuthor('Я уже иду!')
      .setTitle('Пригласить к себе')
      .setURL(
        `https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=305261782`
      )
      .setDescription(
        `[Код на GitHub-е](https://github.com/${packageJson.author.name}/${packageJson.name})`
      )
      .setColor('#99D8E9');

    message.author.send({ embed }).catch(() => {
      embed.setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
    });
  },
};
