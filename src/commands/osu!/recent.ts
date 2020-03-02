import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Последняя игра',
  aliases: ['r', 'rs', 'lastgame'],
  usage: '[@ или ник] [/режим] [/сервер]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const player = await osu.getPlayerFromMessage(message, args);
    const modePick = parseInt(player.modeFavorite || 0, 10);

    const osuRecent = await osu.getUserRecents(
      player.gameServer,
      player.nickname,
      1,
      modePick
    );

    const recentScore = osuRecent[0];
    const recentBeatmap = recentScore.beatmap[0];

    const serverLinks = tools.getDataValueOnKey('osu!/links', player.gameServer);
    const server = tools.getDataValueOnKey('osu!/servers', player.gameServer).name;
    const mode = tools.getDataValueOnKey('osu!/modes', modePick.toString());

    const embed = new Discord.RichEmbed()
      .setAuthor(
        `${player.nickname} играл в osu! ${mode.name} на ${server}`,
        serverLinks.avatar.replace('ID', recentScore.user_id)
      )
      .setTitle(`${recentBeatmap.artist} - ${recentBeatmap.version} // ${recentBeatmap.creator}`)
      .setURL(serverLinks.beatmap.replace('ID', recentScore.beatmap_id))
      .setImage(serverLinks.beatmapset.replace('ID', recentBeatmap.beatmapset_id))
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      )

      .setDescription(
        `**Сложность:** ${recentBeatmap.version} (★${tools.roundDecimalPlaces(recentBeatmap.difficultyrating)})`
        + ` ${modePick === 3 ? `[${recentBeatmap.diff_size}K]` : ''}`
        + (recentScore.enabled_mods === '-' ? `\n**Моды:** ${osu.decodeMods(recentScore.enabled_mods)}` : '')
      )

      .addField('Результат',
        `**Оценка:** ${tools.getDataValueOnKey('osu!/ranks', recentScore.rank) || recentScore.rank}`
        + `\n**Точность:** ${tools.roundDecimalPlaces(recentScore.accuracy)}%`
        + `\n**${(modePick === 3 && recentScore.perfect === '1') ? 'Фулл-комбо' : 'Комбо'}:**`
        + ` ${tools.separateThousandth(recentScore.maxcombo)} / ${tools.separateThousandth(recentBeatmap.max_combo)}`
        + `\n**Счет:** ${tools.separateThousandth(recentScore.score)}`
        , true)
      .addField('Характеристики',
        `**Длина:** ${osu.styleLengthInMS(recentBeatmap.total_length)}`
        + `\n**BPM:** ${recentBeatmap.bpm}`
        + `${modePick === 3 ? '' : `\n**CS:** ${recentBeatmap.diff_size}`} **AR:** ${recentBeatmap.diff_approach}`
        + `\n**OD:** ${recentBeatmap.diff_overall} **HP:** ${recentBeatmap.diff_drain}`
        , true);

    message.channel.send({ embed });
  },
};
