import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const leave = async (message: Message, args: string[]) => {
  const relation = await gildrelations.getOne(
    message.guild!.id,
    message.author.id
  );
  if (relation == null) {
    throw new Error('у тебя нет гильдии, чтобы покидать её.');
  }

  const gild = await gilds.getOne(relation.gildId);
  if (gild?.ownerId == message.author.id) {
    await gilds.remove(message.guild!.id, gild); // Каскадное удаление
    message.reply(`твоя гильдия распущена.`);
    return;
  } else {
    await relation.destroy();
    message.reply(`ты покинул гильдию.`);
    return;
  }
};
