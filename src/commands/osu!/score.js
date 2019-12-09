import Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../modules/tools';
import config from '../../config';


module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Лучший результат на карте',
  aliases: ['s'],
  usage: '<карта> [@ или ник] [/режим]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args, CooldownReset) {
    let idMap = args[0];

    if (!!idMap && idMap.indexOf('/b') !== -1 && !!idMap.match(/[0-9]+$/g)) {
      idMap = idMap.match(/[0-9]+$/g)[0];
    }

    if (!isFinite(idMap)) {
      return message.reply('вы не указали карту. Например ссылку на неё или её ID:'
                + `\n${config.bot_prefix}${this.name} <https://osu.ppy.sh/b/1531842>`
                + `\n${config.bot_prefix}${this.name} 1531842`);
    }

    args = args.slice(1);

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

    let osuMap = osu.get_beatmap(idMap, mode, server);

    if ((!osuMap || !osuMap.length) && mode !== 0) {
      osuMap = osu.get_beatmap(idMap, 0, server);
    }

    if (!osuMap || !osuMap.length) {
      return message.reply(`карта (id: ${idMap}) не найдена (режим: ${osu.getValueOnKeyFromJson('mode', mode)}${mode !== 0 ? ` и ${osu.getValueOnKeyFromJson('mode', 0)}` : ''}).`);
    }
    osuMap = osuMap[0];

    let osuScore = osu.get_scores(idMap, nick, mode, server);
    if (!osuScore || !osuScore.length) {
      return message.reply(`игрок **${nick}** не имеет результатов на указанной карте id: ${idMap} (режим: ${osu.getValueOnKeyFromJson('mode', mode)}).`);
    }
    osuScore = osuScore[0];

    const links = osu.getValueOnKeyFromJson('links', server);

    const embed = new Discord.RichEmbed()
      .setAuthor(`${osuScore.username}, лучший результат (${osu.convertDatetime(osuScore.date)}):`, links.avatar.replace('ID', osuUser.user_id), links.user.replace('ID', osuScore.user_id))
      .setTitle(`${osuMap.artist} - ${osuMap.title} // ${osuMap.creator}`)
      .setURL(links.beatmap.replace('ID', idMap));

    let text = `**Сложность:** ${osuMap.version} (★${tools.toTwoDecimalPlaces(osuMap.difficultyrating)}) ${mode === '3' ? `${osuMap.diff_size}K` : ''}`;
    text += `\n**Длина:** ${osu.convertLength(osuMap.total_length)} **BPM:** ${osuMap.bpm} ${mode === '3' ? '' : `**CS:** ${osuMap.diff_size} `}**AR:** ${osuMap.diff_approach} **OD:** ${osuMap.diff_overall} **HP:** ${osuMap.diff_drain}`;
    text += `\n**Моды:** ${osu.getModsFromJson(osuScore.enabled_mods)}`;
    embed.setDescription(text);

    text = `**Результат:** ${osu.getValueOnKeyFromJson('rank', osuScore.rank)}`;
    text += `\n**Счет:** ${tools.separateThousandth(osuScore.score)}`;
    text += `\n**${(mode === '3' && osuScore.perfect === '1') ? 'Фулл-комбо' : 'Комбо'}:** ${tools.separateThousandth(osuScore.maxcombo)}${osuMap.max_combo ? ` / ${tools.separateThousandth(osuMap.max_combo)}` : ''}`;
    text += `\n**Точность:** ${tools.toTwoDecimalPlaces(osu.calculateAccuracity(mode, osuScore.count300, osuScore.count100, osuScore.count50, osuScore.countmiss, osuScore.countkatu, osuScore.countgeki))}%`;
    embed.addField('Подробнее', text, true);

    text = osu.showStatistic(mode, osuScore.count300, osuScore.count100, osuScore.count50, osuScore.countmiss, osuScore.countkatu, osuScore.countgeki);
    text += `\n**PP:** ${!osuScore.pp ? '-' : osuScore.pp}`;
    embed.addField('Статистика', text, true);

    text = `**Последнее обновление:** ${osu.convertDatetime(osuMap.last_update)}`;
    text += `\n**Статус:** ${osu.getValueOnKeyFromJson('approved', osuMap.approved)} (${osu.convertDatetime(osuMap.approved_date)})`;
    text += `\n**Жанр:** ${osu.getValueOnKeyFromJson('genre', osuMap.genre_id)} **Язык:** ${osu.getValueOnKeyFromJson('lang', osuMap.language_id)}`;
    text += `\n**Источник:** ${osuMap.source ? osuMap.source : '-'}`;
    embed.addField('О карте', text, true);

    embed.setImage(links.beatmapset.replace('ID', osuMap.beatmapset_id));

    embed.setColor(tools.randomHexColor());

    const requestMember = message.guild.members.get(message.author.id);
    embed.setFooter(`Запрос от ${requestMember.nickname ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name} ${idMap}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`} | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`, message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
