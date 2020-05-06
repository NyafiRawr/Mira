import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as warns from '../../modules/warnings';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Присвоить роль заблокированного или настроить наказания',
  aliases: undefined,
  usage: '@кому [длина мута в формате ЧЧ:ММ:СС] / <@роль означающая мут>',
  guild: true,
  hide: true,
  cooldown: 0.5,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять сообщениями!');
    }

    if (!!message.mentions.roles.size) {
      if (!message.member.hasPermission(this.permissions[1])) {
        throw new CustomError('нужно быть администратором!');
      }
      await warns.setRoleMute(message.guild.id, message.mentions.roles.first().id);
    }

    const victim = message.mentions.members.first();
    if (!victim)
      throw new CustomError(
        'укажи кого нужно заблокировать при вызове команды!'
      );

    const roleMuteId = await warns.getRoleMute(message.guild.id);
    if (!!roleMuteId) {
      await victim.addRole(roleMuteId)
        .catch((err) => message.reply(`ошибка в присвоении роли <@&${roleMuteId}>: ${err}`));

      let time = args[1];
      if (!!time) {
        const [hours, minutes, seconds] = time.split(':');
        if (!seconds || !minutes || !hours)
          throw new CustomError('необходимо указать время в формате 00:00:00 (часы:минуты:секунды)');
        const ms = parseInt(hours, 10) * 60 * 60 * 1000 +
          parseInt(minutes, 10) * 60 * 1000 +
          parseInt(seconds, 10) * 1000;
        setTimeout(async () => victim.removeRole(roleMuteId)
          .catch((err) => message.reply(`ошибка в снятии роли-блокировки <@&${roleMuteId}>: ${err}`)), ms);
      } else {
        time = '∞';
      }
      return message.channel.send(`**${victim}** получает блокировку на **${time}**`);
    } else {
      return message.reply('сначала необходимо установить роль для блокировок (только админ может сделать это).');
    }
  },
};
