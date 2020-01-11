import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../modules/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Профиль игрока',
  aliases: ['p'],
  usage: '[@ или ник] [/режим]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(
    message: Discord.Message,
    args: string[] /* , CooldownReset */
  ) {
    const player = await osu.getPlayerFromMessage(message, args);
    if (player === null) {
      return;
    }
    // eslint-disable-next-line prefer-destructuring
    const modePref = parseInt(player.modes?.split(',')[0] || '0', 10);

    const osuUser = await osu.getUser(
      player.gameServer || '',
      player.nickname,
      modePref
    );
    const server = tools.getDataValueOnKey('osu!/servers', player.gameServer)
      .name;
    const dataMode = tools.getDataValueOnKey('osu!/modes', modePref.toString());
    const mode = dataMode.name;

    if (osuUser === null) {
      return message.reply(
        `игрок __**${player.nickname}**__ не найден на сервере __**${server}**__ (режим: __**${modePref}**__).`
      );
    }

    const serverLinks = tools.getDataValueOnKey(
      'osu!/links',
      player.gameServer
    );

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `osu! ${mode} на ${server}`,
        serverLinks.flag.replace('AZ', osuUser.country)
      )
      .setTitle(osuUser.username)
      .setURL(
        serverLinks.user
          .replace('ID', osuUser.user_id)
          .replace('MODE', dataMode.mode)
      )
      .setDescription(
        '**Место в мире:** ' +
          `[#${tools.separateThousandth(
            osuUser.pp_rank
          )}](${serverLinks.pp_world
            .replace('MODE', dataMode.mode)
            .replace('AZ', osuUser.country)
            .replace('P', Math.ceil(osuUser.pp_rank / 50))}) ` +
          `(**${osuUser.country}**[#${tools.separateThousandth(
            osuUser.pp_country_rank
          )}](${serverLinks.pp_country
            .replace('MODE', dataMode.mode)
            .replace('AZ', osuUser.country)
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
