const Discord = require('discord.js');
const users = require('../../modules/users.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Установить дату рождения',
  aliases: ['birth'],
  usage: '<24.06.1997>',
  guild: false,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args /* , CooldownReset */) {
    if (!args.join(' ')) {
      return message.reply(`укажите дату рождения! (${this.usage})`);
    }

    const date = args[0].split('.');

    const dateForValidate = new Date(date[2], date[1], date[0]);

    if (dateForValidate.getFullYear() !== parseInt(date[2], 10)) {
      return message.reply('неправильно указан год!');
    } if (dateForValidate.getMonth() !== parseInt(date[1], 10)) {
      return message.reply('неправильно указан месяц!');
    } if (dateForValidate.getDate() !== parseInt(date[0], 10)) {
      return message.reply('неправильно указан день!');
    }

    users.set(message.guild.id, message.author.id, {
      birthday: `${date[2]}-${date[1]}-${date[0]}`,
    });

    const replyMessage = `${message.author}, ура! Вы родились!`;
    const embed = new Discord.RichEmbed()
      .setColor(tools.randomHexColor())
      .setDescription(`Вы родились ${date.join('.')}`);
    message.channel.send(replyMessage, { embed });
  },
};
