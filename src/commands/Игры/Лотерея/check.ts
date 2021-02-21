import { Message } from 'discord.js';
import config from '../../../config';
import { randomInteger, separateThousandth } from '../../../utils';
import * as economy from '../../../modules/economy';
import Lot from '../../../models/Lot';
import * as lots from '../../../modules/lots';

export const check = async (
    message: Message,
    lottery: Lot
): Promise<boolean> => {
    const members = await lots.getMembers(lottery.id);
    if (members.length !== lottery.membersWait) {
        return false;
    }

    await lots.remove(lottery);

    const winnerIndex = randomInteger(0, lottery.membersWait - 1);

    await economy.setBalance(
        message.guild!.id,
        members[winnerIndex].userId,
        lottery.prize
    );

    const winnerName =
        (await message
            .guild!.members.fetch(members[winnerIndex].userId)
            .catch(() => undefined)
            .then((member) => member?.displayName)) ||
        `<@${members[winnerIndex]}>`;

    await message.channel.send(
        `<@${members[winnerIndex].userId}> победил в лотерее от <@${
            lottery.userId
        }>! ${members
            .filter((_id, index) => index !== winnerIndex)
            .map((member) => `<@${member.userId}>`)
            .join(', ')}`,
        {
            embed: {
                color: config.games.lottery.color,
                title: 'Лотерея завершена!',
                description: `**${winnerName} забирает ${separateThousandth(
                    lottery.prize.toString()
                )}:cookie:**`,
                image: {
                    url:
                        'https://media1.tenor.com/images/757adf1f06b3ffd328339b1b9401db44/tenor.gif',
                },
            },
        }
    );

    return true;
};
