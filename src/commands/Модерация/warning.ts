import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as warns from '../../modules/warnings';
import { convertSecondsToTime } from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Предупреждение',
  aliases: ['warn'],
  usage: '@кому [почему] / set <кол-во варнов> [за сколько дней] [длина мута в формате ЧЧ:ММ:СС]',
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

    if (args[0] === 'set') {
      if (!message.member.hasPermission(this.permissions[1])) {
        throw new CustomError('нужно быть администратором!');
      }

      const count = parseInt(args[1], 10);
      if (!count) throw new CustomError('нужно указать количество предупреждений.');

      const days = args[2];
      if (!days) {
        await warns.setPunch(message.guild.id, count);
        return message.reply(`удалена блокировка за получение ${count} предупреждений, если она была.`);
      }
      const termDays = parseInt(days, 10);
      if (!Number.isInteger(termDays))
        throw new CustomError(
          'необходимо указать количество дней в течение, которых должны быть получено это количество предупреждений.'
        );

      const [hours, minutes, seconds] = args[3].split(':');
      if (!seconds || !minutes || !hours)
        throw new CustomError('необходимо указать время в формате **00:00:00** (часы:минуты:секунды)');

      const ms = parseInt(hours, 10) * 60 * 60 * 1000 +
        parseInt(minutes, 10) * 60 * 1000 +
        parseInt(seconds, 10) * 1000;

      await warns.setPunch(message.guild.id, count, termDays, ms);

      return message.reply(
        `установлена блокировка на срок **${convertSecondsToTime(ms / 1000)}** за получение **${count} предупреждений** в течение **${days} дней**.`
      );
    } else {
      const victim = message.mentions.members.first();
      if (!victim)
        throw new CustomError(
          'укажи кому нужно сделать предупреждение при вызове команды!'
        );

      let reason = args.slice(1).join(' ').trim();
      if (!reason.length) reason = 'Не указана';

      await warns.set(message.guild.id, victim.id, reason);
      return message.channel.send(warns.msg(victim, reason));
    }
  },
};
