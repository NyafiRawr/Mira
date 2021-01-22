import { Message } from 'discord.js';
import * as lots from '../../../modules/lots';
import { check } from './check';

export const join = async (message: Message) => {
  const lottery = await lots.get(message.guild!.id);

  if (lottery === null) {
    throw new Error(
      'на этом сервере не проводится лотерея к которой можно присоединиться.'
    );
  }

  if (lottery.userId === message.author.id) {
    throw new Error('ты организатор лотереи и не можешь участвовать.');
  }

  const members = lottery.memberIds.split(',');
  if (members.includes(message.author.id)) {
    throw new Error('ты уже участвуешь в лотерее, покинуть её нельзя.');
  }

  members.push(message.author.id);
  lottery.memberIds = members.toString();
  await lots.set(
    lottery.serverId,
    lottery.userId,
    lottery.prize,
    lottery.membersWaitCount,
    lottery.memberIds
  );

  await message.channel.send(
    `${message.author} присоединился к лотерее! Участники: ${members.length}/${lottery.membersWaitCount}`
  );

  await check(message, lottery);
};
