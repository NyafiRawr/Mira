const Discord = require('discord.js');
const users = require('../../modules/users.js');
const tools = require('../../modules/tools.js');

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
  async execute(message, args /* , CooldownReset */) {
    const user = message.mentions.users.first() || message.client.users.find((u) => u.username === args.join(' ') || (`${u.username}#${u.discriminator}`) === args.join(' ')) || message.author;
    const member = message.guild.members.get(user.id);

    const nickname = 'себе';
    if (message.author.id != user.id) {
      nickname = (!member || !member.nickname) ? user.username : member.nickname;
    }
    

    const embed = new Discord.RichEmbed();
    embed.setAuthor(`Информация о ${nickname}`, user.avatarURL || user.user.avatarURL);

    embed.setThumbnail(user.avatarURL || user.user.avatarURL);

    embed.addField('Имя аккаунта', `\`${user.tag}\``, true);
    embed.addField('Упоминание', user, true);

    if (user.createdAt) {
      embed.addField('Дата создания', tools.toDate(user.createdAt), true);
    }

    const dbUser = await users.get(message.guild.id, user.id);

    if (!!member && !!member.joinedAt) {
      embed.addField('Первый вход', tools.toDate(dbUser.entryDate || member.joinedAt), true);
      embed.addField('Дата подключения', tools.toDate(member.joinedAt), true);
    }

    if (dbUser.birthday) {
      const birthday = dbUser.birthday.split('-').reverse().join('.');
      embed.addField('День рождения', birthday, true);
    }

    embed.setColor(tools.randomHexColor());

    embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);

    message.channel.send({ embed });
  },
};
