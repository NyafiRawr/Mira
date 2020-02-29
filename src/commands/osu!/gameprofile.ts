import CustomError from '../../utils/customError';
import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Профиль игрока',
  aliases: ['p'],
  usage: '[@ или ник] [/режим] [/сервер]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const player = await osu.getPlayerFromMessage(message, args);
    const modePick = parseInt(player.modeFavorite || '0', 10);

    const osuUser = await osu.getUser(
      player.gameServer,
      player.nickname,
      modePick
    );

    const server = tools.getDataValueOnKey('osu!/servers', player.gameServer).name;
    const mode = tools.getDataValueOnKey('osu!/modes', modePick.toString())?.name;

    const serverLinks = tools.getDataValueOnKey('osu!/links', player.gameServer);

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `osu! ${mode} на ${server}`,
        serverLinks.flag.replace('AZ', osuUser.country)
      )
      .setTitle(osuUser.username)
      .setURL(
        serverLinks.user
          .replace('ID', osuUser.user_id)
          .replace('MODE', mode.toString().toLowerCase())
      )
      .setDescription(
        '**Место в мире:** ' +
        `[#${tools.separateThousandth(
          osuUser.pp_rank
        )}](${serverLinks.pp_world
          .replace('MODE', mode.toString().toLowerCase())
          .replace('RU', osuUser.country)
          .replace('P', Math.ceil(osuUser.pp_rank / 50))}) ` +
        `(**${osuUser.country}**[#${tools.separateThousandth(
          osuUser.pp_country_rank
        )}](${serverLinks.pp_country
          .replace('MODE', mode.toString().toLowerCase())
          .replace('RU', osuUser.country)
          .replace('P', Math.ceil(osuUser.pp_country_rank / 50))}))` +
        `\n**Уровень:** ${tools.roundDecimalPlaces(osuUser.level, 2)}` +
        `\n**PP:** ${tools.separateThousandth(osuUser.pp_raw)}` +
        `\n**Точность:** ${tools.roundDecimalPlaces(osuUser.accuracy, 2)}%` +
        `\n**Сыграно карт:** ${tools.separateThousandth(osuUser.playcount)}`
      )
      .setThumbnail(serverLinks.avatar.replace('ID', osuUser.user_id))
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    message.channel.send({ embed });
  },
};
