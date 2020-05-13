/* eslint-disable no-restricted-syntax */
import * as Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../utils/tools';
import * as players from '../../modules/players';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Аккаунты участника',
  aliases: ['aсs', 'accs', 'acc', 'aks'],
  usage: '[@]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    const victim =
      message.mentions.members.first() ||
      message.guild.members.get(message.author.id);
    const embed = new Discord.RichEmbed()
      .setAuthor('Аккаунты в мире osu!')
      .setTitle(victim.nickname || victim.user.username);

    const accounts = await players.getAll(victim.id);

    if (accounts === null || accounts.length === 0) {
      return message.reply(`у ${victim} нет привязанных аккаунтов.`);
    }

    for (const account of accounts) {
      const user = await osu.getUser(
        account.gameServer,
        account.nickname,
        parseInt(account.modeFavorite, 10)
      );
      if (user != null) {
        const topScores =
          parseInt(user.count_rank_ss, 10) +
          parseInt(user.count_rank_s, 10) +
          parseInt(user.count_rank_ssh, 10) +
          (0 + parseInt(user.count_rank_sh, 10)) +
          (0 + parseInt(user.count_rank_a, 10));
        embed
          .addField(
            (account.gameServerFavorite ? '__' : '') +
              `**${account.gameServer[0].toUpperCase() +
                account.gameServer.slice(1)}**` +
              (account.gameServerFavorite ? '__' : ''),
            `PP: ${tools.separateThousandth(
              user.pp_raw
            )}\nМесто: #${tools.separateThousandth(user.pp_rank)}`,
            true
          )
          .addField(
            `**${
              tools.getDataValueOnKey('osu!/modes', account.modeFavorite).name
            }**`,
            `Уровень: ${Math.floor(
              user.level
            )}\nТочность: ${tools.roundDecimalPlaces(user.accuracy)}%`,
            true
          )
          .addField(
            `Ник: **${user.username}**`,
            `Игр: ${tools.separateThousandth(
              user.playcount
            )}\nТоп-скоры: ${tools.separateThousandth(`${topScores}`)}`,
            true
          );
      }
    }

    embed.setColor(tools.randomHexColor());
    embed.setFooter(
      tools.embedFooter(message, this.name),
      message.author.displayAvatarURL
    );

    message.channel.send({ embed });
  },
};
