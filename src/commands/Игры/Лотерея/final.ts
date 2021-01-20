import { Message } from 'discord.js';
import config from '../../../config';
import { lots } from '../lot';
import { check } from './check';

export const final = async (message: Message) => {
  const lottery = lots.get(message.guild!.id);

  if (lottery === undefined) {
    throw new Error('лотерей нет - нечего завершать.');
  }

  if (lottery.authorId !== message.author.id) {
    throw new Error('ты не организатор лотереи и не можешь её завершить.');
  }

  if (lottery.members.length === 0) {
    throw new Error(
      `невозможно определить победителя без участников, используй \`${config.discord.prefix}lot close\`, если хочешь закрыть лотерею.`
    );
  }

  lottery.membersMaxCount = lottery.members.length;

  await check(message, lottery);
};
