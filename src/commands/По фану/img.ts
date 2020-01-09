import * as Discord from 'discord.js';

import * as tools from '../../modules/tools';

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
  execute(message: Discord.Message, args: string[] /* , CooldownReset */) {
    const findMember = (nickname: string) => {
      const result = message.guild.members.find(
        (m: Discord.GuildMember) => m.nickname === nickname
      );

      return result ? result.user : undefined;
    };

    const user =
      message.mentions.users.first() ||
      findMember(args.join(' ')) ||
      message.client.users.find(
        u => u.tag === args.join(' ') || u.username === args.join(' ')
      ) ||
      message.author;

    const member = message.guild.members.get(user.id);

    const embed = new Discord.RichEmbed()
      .setTitle(
        `Аватар: ${
          !member || !member.nickname ? user.username : member.nickname
        }`
      )
      .setImage(user.displayAvatarURL)
      .setColor('#ffffff')
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    message.channel.send({ embed });
  },
};
