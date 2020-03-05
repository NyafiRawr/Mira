import CustomError from '../../utils/customError';
import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';

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
            throw new CustomError(
              'слишком большое количество для вывода, максимум: 25 (и то, если влезет)'
            );
          }
          args.pop();
        }
      }
    }

    const player = await osu.getPlayerFromMessage(message, args);
    const modePick = parseInt(player.modeFavorite || '0', 10);

    const serverLinks = tools.getDataValueOnKey(
      'osu!/links',
      player.gameServer
    );
    const server = tools.getDataValueOnKey('osu!/servers', player.gameServer)
      .name;
    const mode = tools.getDataValueOnKey('osu!/modes', modePick.toString());

    const osuTop = await osu.getUserTops(
      player.gameServer,
      player.nickname,
      limit,
      modePick
    );

    const embed = new Discord.RichEmbed()
      .setTitle(`${player.nickname} лучшее в osu! ${mode.name} на ${server}`)
      .setURL(
        serverLinks.user
          .replace('ID', osuTop[0].user_id)
          .replace('MODE', mode.mode)
      )
      .setImage(
        serverLinks.beatmapset_cover.replace(
          'ID',
          osuTop[0]?.beatmapset_id || osuTop[0].beatmap?.beatmapset_id
        )
      )
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    let i = 0;
    const scores: string[] = [];
    for (const topResult of osuTop) {
      let score =
        `**${(i += 1)}** | **[${topResult.beatmap.artist} - ${
          topResult.beatmap.title
        }]` +
        `(${serverLinks.beatmap.replace('ID', topResult.beatmap_id)})** | ` +
        `**${tools.getDataValueOnKey('osu!/ranks', topResult.rank) ||
          topResult.rank}**`;
      score +=
        `\nСложность: **${topResult.beatmap.version} ` +
        `(★${tools.roundDecimalPlaces(topResult.beatmap.difficultyrating)})**`;
      if (parseInt(topResult.enabled_mods, 10) === 0) {
        score += `\nТочность: **${tools.roundDecimalPlaces(
          topResult.accuracy
        )}%** PP: **${tools.roundDecimalPlaces(topResult.pp)}**`;
      } else {
        score +=
          `\n+**${osu.decodeMods(topResult.enabled_mods)}** ` +
          `(**${tools.roundDecimalPlaces(
            topResult.accuracy
          )}%**) PP: **${tools.roundDecimalPlaces(topResult.pp)}**`;
      }
      if (scores.join('\n\n').length + score.length > 1300) {
        scores.push('... больше не влезло :(');
        break;
      }

      scores.push(score);
    }
    embed.setDescription(scores.join('\n\n'));

    message.channel.send({ embed });
  },
};
