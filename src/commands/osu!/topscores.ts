import CustomError from '../../utils/customError';
import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';
import config from '../../config';

const defaultLimit = 3;

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Лучшие результаты в профиле',
  aliases: ['ts'],
  usage: '[@ или ник] [/режим] [/сервер] [/кол-во]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    let limit = defaultLimit;
    if (args.length) {
      if (args[args.length - 1][0] === '/') {
        limit = parseInt(args[args.length - 1].substr(1), 10);
        if (isNaN(limit)) {
          limit = defaultLimit;
        } else {
          if (limit < 1) {
            throw new CustomError('количество не может быть меньше единицы');
          } else if (limit > 25) {
            throw new CustomError('слишком большое количество для вывода, максимум: 25 (и то, если влезет)');
          }
          args.pop();
        }
      }
    }

    const player = await osu.getPlayerFromMessage(message, args);
    const modePick = parseInt(player.modeFavorite || '0', 10);

    const osuTop = await osu.getUserTops(
      player.gameServer,
      player.nickname,
      limit,
      modePick
    );

    console.log(osuTop);
    /*
        const serverLinks = tools.getDataValueOnKey('osu!/links', player.gameServer);

        const embed = new Discord.RichEmbed()
          .setAuthor(`${nick} лучшие результаты:`, links.avatar.replace('ID', osuUser.user_id), links.user.replace('ID', osuUser.user_id));

        embed.setColor(tools.randomHexColor());

        const requestMember = message.guild.members.get(message.author.id);
        embed.setFooter(`Запрос от ${requestMember.nickname ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`} | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`, message.author.displayAvatarURL);

        const scores = [];
        for (i in osuUserBest) {
          let osuMap = osu.get_beatmap(osuUserBest[i].beatmap_id, mode, server);
          if (!osuMap || !osuMap.length) {
            continue;
          } else {
            osuMap = osuMap[0];

            if (parseInt(i) === 0) {
              embed.setImage(links.beatmapset.replace('ID', osuMap.beatmapset_id));
            }

            const accuracity = tools.toTwoDecimalPlaces(osu.calculateAccuracity(mode, osuUserBest[i].count300, osuUserBest[i].count100, osuUserBest[i].count50, osuUserBest[i].countmiss, osuUserBest[i].countkatu, osuUserBest[i].countgeki));
            score = `**${parseInt(i) + 1}** | **[${osuMap.artist} - ${osuMap.title}](${links.beatmap.replace('ID', osuMap.beatmap_id)})** | **${osu.getValueOnKeyFromJson('rank', osuUserBest[i].rank)}**`;
            score += `\nСложность: **${osuMap.version} (★${tools.toTwoDecimalPlaces(osuMap.difficultyrating)})**`;
            if (parseInt(osuUserBest[i].enabled_mods) === 0) {
              score += `\nТочность: **${accuracity}%** PP: **${osuUserBest[i].pp}**`;
            } else {
              score += `\n+**${osu.getModsFromJson(osuUserBest[i].enabled_mods)}** (**${accuracity}%**) PP: **${osuUserBest[i].pp}**`;
            }
            if (scores.join('\n\n').length + score.length > 1300) {
              scores.push('... больше не влезло :(');
              break;
            }
            scores.push(score);
          }
        }
        embed.setDescription(scores.join('\n\n'));

        message.channel.send({ embed });*/
  },
};
