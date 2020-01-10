import * as Discord from 'discord.js';

import * as tools from '../../modules/tools';
import * as users from '../../modules/users';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Информация о участнике',
  aliases: ['userinfo', 'member'],
  usage: '[@упоминание]',
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(
    message: Discord.Message,
    args: string[] /* , CooldownReset */
  ) {
    const user: any =
      message.mentions.users.first() ||
      message.client.users.find(
        u =>
          u.username === args.join(' ') ||
          `${u.username}#${u.discriminator}` === args.join(' ')
      ) ||
      message.author;
    const member = message.guild.members.get(user.id);

    let nickname = 'себе';
    if (message.author.id !== user.id) {
      nickname = !member || !member.nickname ? user.username : member.nickname;
    }

    const embed = new Discord.RichEmbed();
    embed.setAuthor(
      `Информация о ${nickname}`,
      user.avatarURL || user.user.avatarURL
    );

    embed.setThumbnail(user.avatarURL || user.user.avatarURL);

    embed.addField('Имя аккаунта', `\`${user.tag}\``, true);
    embed.addField('Упоминание', user, true);

    if (user.createdAt) {
      embed.addField('Дата создания', tools.toDate(user.createdAt), true);
    }

    let lastEntry;
    let firstEntry;
    let birthday;

    if (member) {
      lastEntry = member.joinedAt;
      firstEntry = lastEntry;
    }

    const dbUser = await users.get<any>(message.guild.id, user.id);

    if (dbUser) {
      firstEntry = dbUser.entryDate || firstEntry;
      birthday = dbUser.birthday;
    }

    if (firstEntry) {
      embed.addField('Первый вход', tools.toDate(firstEntry), true);
    }

    if (lastEntry) {
      embed.addField(
        'Дата подключения',
        tools.toDate(lastEntry.toISOString()),
        true
      );
    }

    if (birthday) {
      birthday = dbUser.birthday
        .split('-')
        .reverse()
        .join('.');
      embed.addField('День рождения', birthday, true);
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(
      tools.embedFooter(message, this.name),
      message.author.displayAvatarURL
    );

    message.channel.send({ embed });
  },
};
