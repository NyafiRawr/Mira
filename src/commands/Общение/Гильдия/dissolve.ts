import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';

const permission = 'ADMINISTRATOR';

export const dissolve = async (message: Message, args: string[]) => {
  if (!message.member!.hasPermission(permission)) {
    throw new Error(`нужно иметь глобальную привилегию: ${permission}.`);
  }

  const gildId = args.shift();
  if (gildId == undefined) {
    throw new Error('не указан ID гильдии.');
  }
  const id = parseInt(gildId, 10);
  if (Number.isInteger(id) == false) {
    throw new Error('ID гильдии должен быть целым числом.');
  }
  const gild = await gilds.getOne(message.guild!.id, id);
  if (gild == null) {
    message.reply(`не найдена гильдия с ID: ${id}.`);
  } else {
    await gilds.remove(message.guild!.id, gild); // Каскадное удаление
    message.reply(`гильдия с ID: ${id} принудительно распущена!`);
  }
};
