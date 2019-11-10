const Discord = require('discord.js')
const osu = require('../../modules/osu.js');
const tools = require('../../modules/tools.js');
const players = require('../../modules/players.js');
const config = require('../../config.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Профиль игрока',
  aliases: ['p','osu'],
  usage: '[@ или ник] [/режим]',
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

    let { nick, mode, server } = await osu.searchPlayer(message, args);

    if (!!specificMode) {
      mode = specificMode;
    };

    let osuUser = osu.get_user(nick, mode, server);
    if (!osuUser || !osuUser.length) {
      return message.reply(`игрок **${nick}** не найден.`);
    } else {
      osuUser = osuUser[0];

      let links = osu.getValueOnKeyFromJson('links', server);

      let embed = new Discord.RichEmbed()
        .setAuthor(`${osuUser.username} (pp: ${tools.separateThousandth(Math.floor(osuUser.pp_raw))}) [${osuUser.country} #${tools.separateThousandth(osuUser.pp_country_rank)}]`, links['avatar'].replace('ID', osuUser.user_id))
        .setTitle('Профиль игрока на сайте')
        .setURL(links['user'].replace('ID', osuUser.user_id))

        .addField('Количество игр', tools.separateThousandth(osuUser.playcount), true)
        .addField('Точность', tools.toTwoDecimalPlaces(osuUser.accuracy) + '%', true)
        .addField('Уровень', Math.floor(osuUser.level), true)

        .addField('Место в мире', '#' + tools.separateThousandth(osuUser.pp_rank), true)
        .addField('Рейтинговый счет', tools.separateThousandth(osuUser.ranked_score), true)
        .addField('Общий счет', tools.separateThousandth(osuUser.total_score), true)

      if (server === 'ppy') {
        embed.addField('SS+', tools.separateThousandth(osuUser.count_rank_ssh), true)
        embed.addField('S+', tools.separateThousandth(osuUser.count_rank_sh), true)

        embed.addField('Всего попаданий', tools.separateThousandth(parseInt(osuUser.count300) + parseInt(osuUser.count100) + parseInt(osuUser.count50)), true)

        embed.addField('SS', tools.separateThousandth(osuUser.count_rank_ss), true)
        embed.addField('S', tools.separateThousandth(osuUser.count_rank_s), true)
        embed.addField('A', tools.separateThousandth(osuUser.count_rank_a), true)
      };

      embed.setColor(tools.randomHexColor());

      let requestMember = message.guild.members.get(message.author.id);
      embed.setFooter(`Запрос от ${requestMember['nickname'] ? requestMember.nickname : message.author.username} | ${config.bot_prefix}${this.name}${server === 'ppy' ? '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`} | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`, message.author.displayAvatarURL);

      message.channel.send({ embed });
    };
  },
};
