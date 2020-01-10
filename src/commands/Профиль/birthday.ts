import * as Discord from 'discord.js';
import * as moment from 'moment';

import * as tools from '../../modules/tools';
import * as users from '../../modules/users';

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
  execute(message: Discord.Message, args: string[] /* , CooldownReset */) {
    if (!args.join(' ')) {
      return message.reply(`укажите дату рождения! (${this.usage})`);
    }

    // парсим дату и валидируем ее
    const date = moment(args[0], [
      'DD-MM-YYYY',
      'DD.MM.YYYY',
      'DD.MM.YY',
      'DD-MM-YY',
      'DD MMMM YYYY',
      'MMMM DD YYYY',
    ]);
    if (!date.isValid()) {
      return message.reply('неправильно указана дата!');
    }

    users.set(message.guild.id, message.author.id, {
      birthday: date.toISOString(),
    });

    const replyMessage = `${message.author}, ура! Вы родились!`;
    const embed = new Discord.RichEmbed()
      .setColor(tools.randomHexColor())
      .setDescription(`Вы родились ${date.format('DD.MM.YYYY')}`);

    message.channel.send(replyMessage, { embed });
  },
};
