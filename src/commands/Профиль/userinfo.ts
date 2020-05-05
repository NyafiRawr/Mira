import * as Discord from 'discord.js';

import * as tools from '../../utils/tools';
import * as users from '../../modules/users';
import moment = require('moment');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Информация о участнике',
  aliases: ['user', 'member', 'stats'],
  usage: '[@упоминание]',
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const user: any =
      message.mentions.users.first() ||
      message.client.users.find(
        u =>
          u.username === args.join(' ') ||
          `${u.username}#${u.discriminator}` === args.join(' ')
      ) ||
      message.author;
    const member = message.guild.members.get(user.id);

    let title = 'Кажется, это вы!';
    if (message.author.id !== user.id) {
      title = `Информация о ${
        !member || !member.nickname ? user.username : member.nickname
      }`;
    }

    const embed = new Discord.RichEmbed();
    embed.setAuthor(title, user.avatarURL || user.user.avatarURL);

    embed.setThumbnail(user.avatarURL || user.user.avatarURL);

    embed.addField('Имя аккаунта', `\`${user.tag}\``, true);
    embed.addField('Упоминание', user, true);
    embed.addField('Статус', user.presence.game?.state || '-', true);

    if (user.createdAt) {
      embed.addField('Создан', tools.toDate(user.createdAt), true);
    }

    let lastEntry;
    let firstEntry;
    let birthday;
    let weight;
    let reputation;
    let voiceTime;

    if (member) {
      lastEntry = member.joinedAt;
      firstEntry = lastEntry;
    }

    const dbUser = await users.get(message.guild.id, user.id);
    if (dbUser) {
      firstEntry = dbUser.firstEntry;
      birthday = dbUser.birthday;
      weight = dbUser.weight;
      reputation = dbUser.reputation;
      voiceTime = dbUser.voiceTime;
    }

    if (firstEntry) {
      embed.addField(
        'Первый вход',
        tools.toDate(firstEntry.toISOString()),
        true
      );
    }

    if (lastEntry) {
      embed.addField(
        'Последний вход',
        tools.toDate(lastEntry.toISOString()),
        true
      );
    }

    if (birthday) {
      embed.addField(
        'День рождения',
        moment(birthday).format('DD.MM.YY'),
        true
      );
    }

    if (reputation) {
      embed.addField('Репутация', `${reputation} F`, true);
    }

    if (weight) {
      embed.addField('Вес', `${weight} кг`, true);
    }

    if (voiceTime) {
      embed.addField(
        'Время в голосе',
        `${tools.convertSecondsToTime(voiceTime)}`,
        true
      );
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(
      tools.embedFooter(message, this.name),
      message.author.displayAvatarURL
    );

    message.channel.send({ embed });
  },
};
