const Discord = require('discord.js');
const users = require('../../modules/users.js');
const tools = require('../../modules/tools.js');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Установить дату рождения',
  aliases: ['birth', 'birthday'],
  usage: '<24.06.1997>',
  guild: false,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args /* , CooldownReset */) {
    const date = args[0].split('.');
    const dateForValidate = new Date(date[2], date[1], date[0]);
    if (dateForValidate.getFullYear() !== date[2]) {
      return message.reply('неправильно указан год!');
    } else if (dateForValidate.getMonth() !== date[1]) {
	    return message.reply('неправильно указан месяц!');
    } else if (dateForValidate.getDate() !== date[0]) {
	    return message.reply('неправильно указан день!');
    }

    users.set(message.guild.id, message.author.id, {
      birthday: date[2] + '-' + date[1] + '-' + date[0]
    });

    const replyMessage = 'вы установили день своего рождения, ура!';
    const embed = new Discord.RichEmbed()
      .setColor(tools.randomHexColor())
      .setDescription(`Вы родились ${date.join('.')}`);
    message.channel.send(replyMessage, { embed });
  },
};
