import { Message } from 'discord.js';
import { lots } from '../lottery';
import * as economy from '../../../modules/economy';

export const close = async (message: Message) => {
  const lottery = lots.get(message.guild!.id);

  if (lottery === undefined) {
    throw new Error('лотерей нет - нечего закрывать.');
  }

  if (lottery.authorId !== message.author.id) {
    throw new Error('ты не организатор лотереи и не можешь её закрыть.');
  }

  lots.delete(message.guild!.id);
  await economy.setBalance(message.guild!.id, message.author.id, lottery.prize);

  await message.channel.send(
    `Лотерея от ${message.author} закрыта! ${lottery.members
      .map((id) => `<@${id}>`)
      .join(', ')}`
  );
};
