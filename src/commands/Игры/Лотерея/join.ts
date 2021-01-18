import { Message } from 'discord.js';
import { lots } from '../lottery';
import { check } from './check';

export const join = async (message: Message) => {
  const lottery = lots.get(message.guild!.id);

  if (lottery === undefined) {
    throw new Error(
      'на этом сервере не проводится лотерея к которой можно присоединиться.'
    );
  }

  if (lottery.authorId === message.author.id) {
    throw new Error('ты организатор лотереи и не можешь участвовать.');
  }

  if (lottery.members.includes(message.author.id)) {
    throw new Error('ты уже участвуешь в лотерее, покинуть её нельзя.');
  }

  lottery.members.push(message.author.id);
  lots.set(message.guild!.id, lottery);

  await message.channel.send(`${message.author} присоединился к лотерее!`);

  await check(message, lottery);
};
