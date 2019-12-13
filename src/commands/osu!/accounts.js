/* eslint-disable no-restricted-syntax */
import Discord from 'discord.js';
import * as osu from '../../modules/osu';
import * as tools from '../../modules/tools';
import * as players from '../../modules/players';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Аккаунты участника',
  aliases: ['acs', 'aks'],
  usage: '[@]',
  guild: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message /* , args, CooldownReset */) {
    const victim = message.mentions.members.first() || message.guild.members.get(message.author.id);
    const embed = new Discord.RichEmbed()
      .setAuthor('Аккаунты в мире osu!')
      .setTitle(victim.nickname || victim.username || victim.user.username);

    const accounts = await players.get(victim.id);

    if (accounts.length === 0) {
      return message.reply(`у ${victim} нет привязанных аккаунтов.`);
    }

    // превращаем строки с модами в массивы для перебора далее
    for (let i = 0; i < accounts.length; i += 1) {
      if (accounts[i].modes.length > 1) {
        accounts[i].modes = accounts[i].modes.split(',');
      }
    }

    for (const account of accounts) {
      for (const mode of account.modes) {
        // eslint-disable-next-line no-await-in-loop
        const user = await osu.getUser(account.gameServer, account.nickname, mode);
        if (user != null) {
          console.log(user);
          const topScores = parseInt(user.count_rank_ss, 10) + parseInt(user.count_rank_s, 10)
          + parseInt(user.count_rank_a, 10)
          + parseInt(user.count_rank_ssh, 10) || 0 + parseInt(user.count_rank_sh, 10) || 0;
          embed
            .addField(`**${account.gameServer.toUpperCase()}**`, `PP: ${tools.separateThousandth(Math.floor(user.pp_raw))}\nМесто: #${tools.separateThousandth(user.pp_rank)}`, true)
            .addField(`**${(tools.getDataValueOnKey('osu!/mode', mode))[0].toUpperCase()}**`, `Уровень: ${Math.floor(user.level)}\nТочность: ${tools.toTwoDecimalPlaces(user.accuracy)}%`, true)
            .addField(`Ник: **${user.username}**`, `Игр: ${tools.separateThousandth(user.playcount)}\nТоп-скоры: ${tools.separateThousandth(topScores)}`, true);
        }
      }
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(tools.embedFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
