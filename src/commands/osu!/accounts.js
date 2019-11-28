/* eslint-disable no-restricted-syntax */
const Discord = require('discord.js');
const osu = require('../../modules/osu.js');
const tools = require('../../modules/tools.js');
const players = require('../../modules/players.js');

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
    const victim = message.mentions.members.first() || message.author;

    const embed = new Discord.RichEmbed()
      .setAuthor(victim)
      .setTitle(`Аккаунты ${victim}`);

    const accounts = await players.get(victim.id);

    // превращаем строки с модами в массивы для перебора далее
    for (let i = 0; i < accounts.length; i += 1) {
      if (accounts[i].modes.length > 1) {
        accounts[i].modes = accounts[i].modes.split(',');
      }
    }

    for (const account of accounts) {
      for (const mode of account.modes) {
        const user = await osu.get_user(account.nickname, mode, account.gameServer);
        if (user != null) {
          const topScores = user.count_rank_ssh || 0 + user.count_rank_sh || 0 + user.count_rank_ss
          + user.count_rank_s + user.count_rank_a;
          embed
            .addField(account.gameServer, `Место: ${tools.separateThousandth(user.pp_rank)}\nТочность: ${tools.toTwoDecimalPlaces(user.accuracy)}`, true)
            .addField(`Ник: ${user.username}`, `Уровень: ${Math.floor(user.level)}\nPP: ${tools.separateThousandth(Math.floor(user.pp_raw))}`, true)
            .addField(`Режим: ${osu.getKeyFromSearchOnValueFromJson('mode', mode)}`, `Топ-скоры: ${tools.separateThousandth(topScores)}\nИгр: ${tools.separateThousandth(user.playcount)}`, true);
        }
      }
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
