import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as mutes from '../../modules/mutes';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Присвоить роль заблокированного',
  aliases: undefined,
  usage: '@кому [длина мута в формате ЧЧ:ММ:СС] [причина] / <@роль означающая мут>',
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

    // Установка блокировочной роли
    if (!!message.mentions.roles.size) {
      if (!message.member.hasPermission(this.permissions[1])) {
        throw new CustomError('нужно быть администратором!');
      }

      await mutes.setRoleMute(message.guild.id, message.mentions.roles.first().id);

      return message.reply(`роль ${message.mentions.roles.first()} установлена как блокировочная.`);
    }

    const victim = message.mentions.members.first();
    if (!victim)
      throw new CustomError(
        'укажи кого нужно заблокировать при вызове команды!'
      );

    const [hours, minutes, seconds] = args.length > 1 ? args[1].split(':') : [];
    if (!seconds || !minutes || !hours)
      throw new CustomError(
        'необходимо указать время в формате 00:00:00 (часы:минуты:секунды)!'
      );

    const ms = parseInt(hours, 10) * 60 * 60 * 1000 +
      parseInt(minutes, 10) * 60 * 1000 +
      parseInt(seconds, 10) * 1000;

    const reason = args[2];

    await mutes.punch(message.guild.id, victim.id, ms, reason || 'Мут выдан вручную, без указания причины');

    return message.channel.send(mutes.msg(victim, ms, reason || 'Не указана'));
  },
};
