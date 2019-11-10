let Discord = require('discord.js')
let osu = require('../../modules/osu.js');
let tools = require('../../modules/tools.js');
let config = require('../../config.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Лучшие результаты в профиле',
  aliases: ['ts', 'tops'],
  usage: '[@ или ник] [\\кол-во] [/режим]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args, CooldownReset) {
    args = args.join(' ');

    let specificMode;

    if (args.lastIndexOf('/') !== -1) {
      let specifyMode = osu.getKeyFromSearchOnValueFromJson('mode', args.substr(args.lastIndexOf('/') + 1));
      if (!specifyMode.searchResult) {
        return message.reply(specifyMode.result);
      } else {
        args = args.slice(0, args.lastIndexOf('/') - 1);
        specificMode = specifyMode.result;
      };
    };

    let amount;

    if (args.lastIndexOf('\\') !== -1) {
      amount = parseInt(args.substr(args.lastIndexOf('\\') + 1), 10);
      if (amount < 1) {
        return message.reply('число отображаемых скоров не может быть меньше единицы.');
      } else if (amount > 25) {
        return message.reply('слишком большое число отображаемых скоров, максимум: 25 (если влезет).');
      };
      args = args.slice(0, args.lastIndexOf('\\') - 1);
    };

    let { nick, mode, server } = await osu.searchPlayer(message, args);

    if (!!specificMode) {
      mode = specificMode;
    };

    let osuUser = osu.get_user(nick, mode, server);
    if (!osuUser || !osuUser.length) {
      return message.reply(`игрок **${nick}** не найден.`);
    } else {
      osuUser = osuUser[0];

      let osuUserBest = osu.get_user_best(nick, mode, server, amount);
      if (!osuUserBest || !osuUserBest.length) {
        return message.reply(`игрок **${nick}** не имеет результатов в режиме ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`);
      } else {
        let links = osu.getValueOnKeyFromJson('links', server);

        let embed = new Discord.RichEmbed()
          .setAuthor(`${nick} лучшие результаты:`, links['avatar'].replace('ID', osuUser.user_id), links['user'].replace('ID', osuUser.user_id))

        embed.setColor(tools.randomHexColor());

        let requestMember = message.guild.members.get(message.author.id);
        embed.setFooter(`Запрос от ${requestMember['nickname'] ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`} | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`, message.author.displayAvatarURL);

        let scores = [];
        for (i in osuUserBest) {
          let osuMap = osu.get_beatmap(osuUserBest[i].beatmap_id, mode, server);
          if (!osuMap || !osuMap.length) {
            continue;
          } else {
            osuMap = osuMap[0];

            if (parseInt(i) === 0) {
              embed.setImage(links['beatmapset'].replace('ID', osuMap.beatmapset_id));
            };

            let accuracity = tools.toTwoDecimalPlaces(osu.calculateAccuracity(mode, osuUserBest[i].count300, osuUserBest[i].count100, osuUserBest[i].count50, osuUserBest[i].countmiss, osuUserBest[i].countkatu, osuUserBest[i].countgeki));
            score = `**${parseInt(i) + 1}** | **[${osuMap.artist} - ${osuMap.title}](${links['beatmap'].replace('ID', osuMap.beatmap_id)})** | **${osu.getValueOnKeyFromJson('rank', osuUserBest[i].rank)}**`;
            score += `\nСложность: **${osuMap.version} (★${tools.toTwoDecimalPlaces(osuMap.difficultyrating)})**`
            if (parseInt(osuUserBest[i].enabled_mods) === 0) {
              score += `\nТочность: **${accuracity}%** PP: **${osuUserBest[i].pp}**`;
            } else {
              score += `\n+**${osu.getModsFromJson(osuUserBest[i].enabled_mods)}** (**${accuracity}%**) PP: **${osuUserBest[i].pp}**`;
            };
            if (scores.join('\n\n').length + score.length > 1300) {
              scores.push('... больше не влезло :(')
              break;
            };
            scores.push(score);
          };
        };

        embed.setDescription(scores.join('\n\n'));

        message.channel.send({ embed });
      };
    };
  },
};
