import { Message } from 'discord.js';
import * as vars from '../../../modules/vars';
import { keyMaxMembers } from '../lottery';

export const maxmembers = async (message: Message, args: string[]) => {
  const num = args.shift();
  if (num === undefined) {
    throw new Error('не указано новое число участников.');
  }
  const maxMembers = parseInt(num, 10);
  if (Number.isInteger(maxMembers) === false) {
    throw new Error('нужно указать целочисленное и положительное число.');
  }

  await vars.set(message.guild!.id, keyMaxMembers, maxMembers.toString());

  await message.reply(
    `изменена серверная настройка - максимальное количество участников в создаваемой лотерее: ${maxMembers}:person_frowning:`
  );
};
