import { Message } from 'discord.js';
import * as lots from '../../../modules/lots';
import * as economy from '../../../modules/economy';

export const close = async (message: Message) => {
  const lottery = await lots.get(message.guild!.id);

  if (lottery === null) {
    throw new Error('лотерей нет - нечего закрывать.');
  }

  if (lottery.userId !== message.author.id) {
    throw new Error('ты не организатор лотереи и не можешь её закрыть.');
  }

  const members = await lots.getMembers(lottery.id);
  await lottery.destroy(); // Так же удаляет участников

  await economy.setBalance(message.guild!.id, message.author.id, lottery.prize);

  await message.channel.send(
    `Лотерея от ${message.author} закрыта! ${members
      .map((member) => `<@${member.userId}>`)
      .join(', ')}`
  );
};
