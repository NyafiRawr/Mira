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
  async execute(message, args /* , CooldownReset */) {
    const victim = message.mentions.members.first() || message.author;
    const embed = new Discord.RichEmbed()
      .setAuthor(victim)
      .setTitle(`Аккаунты ${victim}`);

    const list = await players.get(victim.id);

    for (account of list) {
      for (mode of account.modes) {
        const user = await osu.getUser(account.gameServer, account.nickname, mode);
        if (user != null) {
		  const topScores = user.count_rank_ssh || 0 + user.count_rank_sh || 0 + user.count_rank_ss + user.count_rank_s + user.count_rank_a;
          embed
            .addField(account.gameServer, `Место: ${tools.separateThousandth(user.pp_rank)}\nТочность: ${tools.toTwoDecimalPlaces(user.accuracy)}`, true)
            .addField(`Ник: ${user.username}`, `Уровень: ${Math.floor(user.level)}\nPP: ${tools.separateThousandth(Math.floor(user.pp_raw))}`, true)
            .addField(`Режим: ${tools.getKeyFromSearchOnValueFromJson('../data/osu!/mode.json', mode)}`, `Топ-скоры: ${tools.separateThousandth(topScores)}\nИгр: ${tools.separateThousandth(user.playcount)}`, true);
        }
      }
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
