import Discord from 'discord.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import modes from '../../data/osu!/mode.json';
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
  async execute(message, args /* , CooldownReset */) {
    //= p @NyafiRawr#7358 .mania .gatari
    let params = args.join(' ');

    let specificMode = 0;

    // let { params, mode } = function getLastArgument
    // как узнать что за параметр указан?
    const positionArgument = params.lastIndexOf('.');

    if (positionArgument !== -1) {
      specificMode = params.substr(positionArgument + 1);

      specificMode = modes[
        [...args].pop() // избавляемся от проксирования pop на оригинальный args
      ];
      if (specificMode.resultSearch) {
        return message.reply(specificMode.content);
      }
      params = params.slice(0, positionArgument - 1);
      specificMode = specificMode.resultSearch;
    }

    // eslint-disable-next-line prefer-const
    let { nick, mode, server } = await osu.searchPlayer(message, args);

    if (specificMode) {
      mode = specificMode;
    }

    let osuUser = await osu.getUser(nick, mode, server);
    if (!osuUser || !osuUser.length) {
      return message.reply(`игрок **${nick}** не найден.`);
    }
    // eslint-disable-next-line prefer-destructuring
    osuUser = osuUser[0];

    const links = osu.getValueOnKeyFromJson('links', server);

    const embed = new Discord.RichEmbed()
      .setAuthor(`${osuUser.username} (pp: ${tools.separateThousandth(Math.floor(osuUser.pp_raw))}) [${osuUser.country} #${tools.separateThousandth(osuUser.pp_country_rank)}]`, links.avatar.replace('ID', osuUser.user_id))
      .setTitle('Профиль на сайте')
      .setURL(links.user.replace('ID', osuUser.user_id))

      .addField('Количество игр', tools.separateThousandth(osuUser.playcount), true)
      .addField('Точность', `${tools.toTwoDecimalPlaces(osuUser.accuracy)}%`, true)
      .addField('Уровень', Math.floor(osuUser.level), true)

      .addField('Место в мире', `#${tools.separateThousandth(osuUser.pp_rank)}`, true)
      .addField('Рейтинговый счет', tools.separateThousandth(osuUser.ranked_score), true)
      .addField('Общий счет', tools.separateThousandth(osuUser.total_score), true);

    if (server === 'ppy') {
      embed.addField('SS+', tools.separateThousandth(osuUser.count_rank_ssh), true);
      embed.addField('S+', tools.separateThousandth(osuUser.count_rank_sh), true);

      embed.addField('Всего попаданий', tools.separateThousandth(parseInt(osuUser.count300, 0) + parseInt(osuUser.count100, 0) + parseInt(osuUser.count50, 0)), true);

      embed.addField('SS', tools.separateThousandth(osuUser.count_rank_ss), true);
      embed.addField('S', tools.separateThousandth(osuUser.count_rank_s), true);
      embed.addField('A', tools.separateThousandth(osuUser.count_rank_a), true);
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(tools.embedFooter(message, this.name), message.author.displayAvatarURL);
    // embed.setFooter(
    // `Запрос от ${requestMember.nickname ? requestMember.nickname : message.author.username}
    // | ${config.bot_prefix}${this.name}${server === 'ppy' ?
    // '' : ` | ${osu.getValueOnKeyFromJson('server', server)}`}
    // | ${tools.toTitle(osu.getValueOnKeyFromJson('mode', mode))}`,
    // message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
