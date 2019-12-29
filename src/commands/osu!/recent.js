import Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../modules/tools';
import config from '../../config';


module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Последняя игра',
  aliases: ['r', 'lastgame'],
  usage: '[@ или ник] [/режим]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args, CooldownReset) {
    let specificMode;

    if (args.lastIndexOf('/') !== -1) {
      const specifyMode = osu.getKeyFromSearchOnValueFromJson('mode', args.substr(args.lastIndexOf('/') + 1));
      if (!specifyMode.searchResult) {
        return message.reply(specifyMode.result);
      }
      args = args.slice(0, args.lastIndexOf('/') - 1);
      specificMode = specifyMode.result;
    }

    let { nick, mode, server } = await osu.searchPlayer(message, args);

    if (specificMode) {
      mode = specificMode;
    }

    let osuUser = osu.get_user(nick, mode, server);
    if (!osuUser || !osuUser.length) {
      return message.reply(`игрок **${nick}** не найден.`);
    }
    osuUser = osuUser[0];

    let osuRecent = osu.get_user_recent(nick, mode, server);
    if (!osuRecent || !osuRecent.length) {
      return message.reply(`игрок **${nick}** последнее время ничего не играл (режим: ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))})`);
    }
    osuRecent = osuRecent[0];

    let osuMap = osu.get_beatmap(osuRecent.beatmap_id, mode, server);

    if ((!osuMap || !osuMap.length) && mode !== 0) {
      osuMap = osu.get_beatmap(osuRecent.beatmap_id, 0, server);
    }

    if (!osuMap || !osuMap.length) {
      return message.reply(`не удалось получить информацию о карте (режим: ${osu.getValueOnKeyFromJson('mode', mode)}${mode !== 0 ? ` и ${osu.getValueOnKeyFromJson('mode', 0)}` : ''}).`);
    }
    osuMap = osuMap[0];

    const links = osu.getValueOnKeyFromJson('links', server);

    const embed = new Discord.RichEmbed()
      .setAuthor(`${nick} последний раз играл:`, links.avatar.replace('ID', osuUser.user_id), links.user.replace('ID', osuUser.user_id))
      .setTitle(`${osuMap.artist} - ${osuMap.title} // ${osuMap.creator}`)
      .setURL(links.beatmap.replace('ID', osuRecent.beatmap_id));

    text = `**Сложность:** ${osuMap.version} (★${tools.toTwoDecimalPlaces(osuMap.difficultyrating)}) ${mode === '3' ? `[${osuMap.diff_size}K]` : ''}`;
    text += `\n**Длина:** ${osu.convertLength(osuMap.total_length)} **BPM:** ${osuMap.bpm} ${mode === '3' ? '' : `**CS:** ${osuMap.diff_size} `}**AR:** ${osuMap.diff_approach} **OD:** ${osuMap.diff_overall} **HP:** ${osuMap.diff_drain}`;
    text += `\n**Моды:** ${osu.getModsFromJson(osuRecent.enabled_mods)}`;
    embed.setDescription(text);

    text = `**Оценка:** ${osu.getValueOnKeyFromJson('rank', osuRecent.rank)}`;
    text += `\n**Счет:** ${tools.separateThousandth(osuRecent.score)}`;
    text += `\n**${(mode === '3' && osuRecent.perfect === '1') ? 'Фулл-комбо' : 'Комбо'}:** ${tools.separateThousandth(osuRecent.maxcombo)}${osuMap.max_combo ? ` / ${tools.separateThousandth(osuMap.max_combo)}` : ''}`;
    text += `\n**Точность:** ${tools.toTwoDecimalPlaces(osu.calculateAccuracity(mode, osuRecent.count300, osuRecent.count100, osuRecent.count50, osuRecent.countmiss, osuRecent.countkatu, osuRecent.countgeki))}%`;
    embed.addField('Подробнее', text, true);

    text = osu.showStatistic(mode, osuRecent.count300, osuRecent.count100, osuRecent.count50, osuRecent.countmiss, osuRecent.countkatu, osuRecent.countgeki);
    const osuScore = osu.get_scores(osuMap.beatmap_id, osuUser.user_id, mode);
    text += `\n**PP:** ${(!osuScore[0] || !osuScore[0].pp) ? (osuMap.approved === 4 ? '-' : 0) : osuScore[0].pp}`;
    embed.addField('Статистика', text, true);

    text = `**Последнее обновление:** ${osu.convertDatetime(osuMap.last_update)}`;
    text += `\n**Статус:** ${osu.getValueOnKeyFromJson('approved', osuMap.approved)} (${osu.convertDatetime(osuMap.approved_date)})`;
    text += `\n**Жанр:** ${osu.getValueOnKeyFromJson('genre', osuMap.genre_id)} **Язык:** ${osu.getValueOnKeyFromJson('lang', osuMap.language_id)}`;
    text += `\n**Источник:** ${osuMap.source ? osuMap.source : '-'}`;
    embed.addField('О карте', text, true);

    embed.setImage(links.beatmapset.replace('ID', osuMap.beatmapset_id));

    embed.setColor(tools.randomHexColor());

    const requestMember = message.guild.members.get(message.author.id);
    embed.setFooter(`Запрос от ${requestMember.nickname ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`} | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`, message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
