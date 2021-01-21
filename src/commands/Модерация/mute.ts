import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import * as punches from '../../modules/mutes';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Изолировать участника от остальных',
  usage: '<@> [срок в минутах] [причина] ИЛИ role <@роль>',
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (!message.member?.hasPermission(this.permissions[0])) {
      throw new Error(
        `нужно иметь глобальную привилегию ${this.permissions[0]}`
      );
    }

    if (args.shift() === 'role') {
      if (message.mentions.roles.size) {
        const role = message.mentions.roles.first()!;
        await punches.setMuteRoleId(message.guild!.id, role.id);
        await message.reply(
          `роль ${role} будет использоваться для изоляции участников.`
        );
      } else {
        await punches.removeMuteRoleId(message.guild!.id);
        await message.reply(`роль для изоляции участников удалена.`);
      }
      return;
    }

    if (message.mentions.users.size === 0) {
      throw new Error('нужно упомянуть участника, которого нужно изолировать.');
    }
    const victim = message.mentions.users.first()!;

    const argTime = args.shift();
    if (argTime === undefined) {
      throw new Error('не указан срок изоляции.');
    }
    const minutes = parseInt(argTime, 10);
    if (isInteger(minutes) === false) {
      throw new Error('минуты должны быть целочисленными и положительными.');
    } else if (minutes < punches.minutesCheckReleases) {
      throw new Error(
        `срок изоляции не должен быть меньше ${punches.minutesCheckReleases} мин.`
      );
    }
    const timestamp = minutes * 60 * 1000;

    const reason = args.shift();
    if (reason === undefined) {
      throw new Error('не указана причина изоляции.');
    }

    const embed = await punches.setMute(
      message.guild!.id,
      victim.id,
      reason,
      message.author.id,
      message.channel.toString(),
      timestamp
    );

    await message.channel.send(embed);
  },
};
