import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import config from '../../config';
import * as punches from '../../modules/mutes';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Изолировать участника от остальных',
  usage:
    'give <@> <срок в минутах> <причина> ИЛИ remove <@> <причина> ИЛИ role <@роль>',
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    if (!message.member?.hasPermission(this.permissions[0])) {
      throw new Error(
        `нужно иметь глобальную привилегию ${this.permissions[0]}`
      );
    }

    const action = args.shift();
    if (action === 'role') {
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

    if (action === 'give') {
      if (message.mentions.members?.size === 0) {
        throw new Error(
          'нужно упомянуть участника, которого нужно изолировать.'
        );
      }
      const victim = message.mentions.members!.first()!;
      args.shift();

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

      const reason = args.join();
      if (reason === undefined) {
        throw new Error('не указана причина изоляции.');
      }

      const roleId = await punches.getMuteRoleId(message.guild!.id);
      if (roleId === null) {
        throw new Error('не установлена роль изоляции.');
      }

      await victim.roles.add(roleId);

      const embed = await punches.setMute(
        message.guild!.id,
        victim.id,
        reason,
        message.author.id,
        message.channel.toString(),
        timestamp
      );

      await message.channel.send(embed);
      return;
    }

    if (action === 'remove') {
      if (message.mentions.members?.size === 0) {
        throw new Error(
          'нужно упомянуть участника, которого нужно освободить.'
        );
      }
      const victim = message.mentions.members!.first()!;

      const roleId = await punches.getMuteRoleId(message.guild!.id);
      if (roleId === null) {
        throw new Error('не установлена роль изоляции.');
      }

      const reason = args.shift();
      if (reason === undefined) {
        throw new Error('не указана причина освобождения.');
      }

      const embed = await punches.removeMute(
        message.guild!.id,
        victim.id,
        reason,
        message.author.id
      );

      await victim.roles.remove(roleId);

      if (embed) {
        await message.channel.send(embed);
      } else {
        await message.reply(
          'запись о муте не найдена, но, если у этого участника была роль изолированного, то она снята.'
        );
      }
      return;
    }

    throw new Error(
      `используйте \`${config.discord.prefix}help ${this.name}\`, чтобы узнать, как использовать эту команду.`
    );
  },
};
