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

    const members = await lots.getMembers(lottery.id);
    if (members.some((member) => member.userId === message.author.id)) {
        throw new Error('ты уже участвуешь в лотерее, покинуть её нельзя.');
    }

    await lots.addMember(lottery.id, message.author.id);

    await lots.set(
        lottery.serverId,
        lottery.userId,
        lottery.prize,
        lottery.membersWait
    );

    await message.channel.send(
        `${message.author} присоединился к лотерее! Участники: ${
            members.length + 1
        }/${lottery.membersWait}`
    );

    await check(message, lottery);
};
