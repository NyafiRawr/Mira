import { Message } from 'discord.js';
import config from '../../../config';
import * as lots from '../../../modules/lots';
import { check } from './check';

export const final = async (message: Message) => {
  const lottery = await lots.get(message.guild!.id);

  if (lottery === null) {
    throw new Error('лотерей нет - нечего завершать.');
  }

  if (lottery.userId !== message.author.id) {
    throw new Error('ты не организатор лотереи и не можешь её завершить.');
  }

  const members = lottery.memberIds.split(',');
  if (members.length === 0) {
    throw new Error(
      `невозможно определить победителя без участников, используй \`${config.discord.prefix}lot close\`, если хочешь закрыть лотерею.`
    );
  }

  lottery.membersWaitCount = members.length;

  await check(message, lottery);
};
