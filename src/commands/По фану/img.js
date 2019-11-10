const Discord = require('discord.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Показать аватар участника',
  aliases: ['avatar', 'ava'],
  usage: '[@ или ник или имя]',
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args /* , CooldownReset */) {
    const findMember = (nickname) => {
      const result = message.guild.members
        .find((m) => m.nickname === nickname);

      return result ? result.user : undefined;
    };

    const user = message.mentions.users.first()
            || findMember(args.join(' '))
            || message.client.users.find((u) => u.tag === args.join(' ') || u.username === args.join(' '))
            || message.author;

    const member = message.guild.members.get(user.id);

    const embed = new Discord.RichEmbed()
      .setTitle(`Аватар: ${(!member || !member.nickname) ? user.username : member.nickname}`)
      .setImage(user.displayAvatarURL)
      .setColor('#ffffff');

    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
