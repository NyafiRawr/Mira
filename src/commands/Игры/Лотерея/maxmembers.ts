import { Message } from 'discord.js';
import * as vars from '../../../modules/vars';
import * as lots from '../../../modules/lots';

const permission = 'ADMINISTRATOR';

export const maxmembers = async (message: Message, args: string[]) => {
  if (!message.member?.hasPermission(permission)) {
    throw new Error(`нужно иметь глобальную привилегию: ${permission}.`);
  }

  const num = args.shift();
  if (num === undefined) {
    throw new Error('не указано новое число участников.');
  }
  const maxMembers = parseInt(num, 10);
  if (Number.isInteger(maxMembers) === false) {
    throw new Error('нужно указать целочисленное и положительное число.');
  }

  await vars.set(message.guild!.id, lots.keyMaxMembers, maxMembers.toString());

  await message.reply(
    `изменена серверная настройка - максимальное количество участников в создаваемой лотерее: ${maxMembers}:person_frowning:`
  );
};
