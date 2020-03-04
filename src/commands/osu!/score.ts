import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';
import CustomError from '../../utils/customError';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Лучший результат на карте',
  aliases: ['s'],
  usage: '<ID карты> [@ или ник] [/режим] [/сервер]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const pickMapId = args.shift() || 'NaN';
    if (isNaN(parseInt(pickMapId, 10))) throw new CustomError('первым аргументом необходимо указать ID карты!');

    const player = await osu.getPlayerFromMessage(message, args);
    const modePick = parseInt(player.modeFavorite || 0, 10);

    const osuScore = await osu.getScores(
      player.gameServer,
      player.nickname,
      pickMapId,
      1,
      modePick
    );

    const score = osuScore[0];
    const beatmap = score.beatmap;

    const serverLinks = tools.getDataValueOnKey('osu!/links', player.gameServer);
    const server = tools.getDataValueOnKey('osu!/servers', player.gameServer).name;
    const mode = tools.getDataValueOnKey('osu!/modes', modePick.toString());

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `${player.nickname} результат из osu! ${mode.name} на ${server}`,
        serverLinks.avatar.replace('ID', score.user_id)
      )
      .setTitle(`${beatmap.artist} - ${beatmap.version}${
        !!beatmap.creator ? ' // ' + beatmap.creator : '' }`)
      .setURL(serverLinks.beatmap.replace('ID', beatmap.beatmap_id))
      .setImage(serverLinks.beatmapset_cover.replace('ID', beatmap.beatmapset_id))
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      )

      .setDescription(
        `**Сложность:** ${beatmap.version} (★${tools.roundDecimalPlaces(beatmap.difficultyrating)})`
        + ` ${modePick === 3 && !beatmap.diff_size ? `[${beatmap.diff_size}K]` : ''}`
        + (score.enabled_mods === '-' ? `\n**Моды:** ${osu.decodeMods(score.enabled_mods)}` : '')
      )

      .addField('Результат',
        `**Оценка:** ${tools.getDataValueOnKey('osu!/ranks', score.rank) || score.rank}`
        + `\n**Точность:** ${tools.roundDecimalPlaces(score.accuracy)}%`
        + `\n**Комбо:** ${tools.separateThousandth(score.maxcombo)}${
          !!score.max_combo ? ' / ' + tools.separateThousandth(beatmap.max_combo) : ''}`
        + `\n**Счет:** ${tools.separateThousandth(score.score)}`
        , true)
      .addField('Характеристики',
        `**PP:** ${score.pp || '-'}`
        + `\n**Длина:** ${osu.styleLengthInMS(beatmap.total_length)}`
        + `\n**BPM:** ${beatmap.bpm}`
        + `${modePick === 3 ? '' : `\n**CS:** ${beatmap.diff_size}`} **AR:** ${beatmap.diff_approach}`
        + `\n**OD:** ${beatmap.diff_overall} **HP:** ${beatmap.diff_drain}`
        , true);

    message.channel.send({ embed });
  },
};
