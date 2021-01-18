import { Message } from 'discord.js';
import config from '../../../config';
import { randomInteger, separateThousandth } from '../../../utils';
import { lots, Lot } from '../lottery';
import * as economy from '../../../modules/economy';

export const check = async (
  message: Message,
  lottery: Lot
): Promise<boolean> => {
  if (lottery.members.length !== lottery.membersMaxCount) {
    return false;
  }

  lots.delete(message.guild!.id);

  const winnerIndex = randomInteger(0, lottery.membersMaxCount - 1);

  await economy.setBalance(
    message.guild!.id,
    lottery.members[winnerIndex],
    lottery.prize
  );

  await message.channel.send(
    `<@${lottery.members[winnerIndex]}> победил в лотерее от <@${
      lottery.authorId
    }>! ${lottery.members.map((id) => `<@${id}>`).join(', ')}`,
    {
      embed: {
        color: config.games.lottery.color,
        author: {
          name: 'Лотерея',
        },
        title: 'Победитель определен!',
        description: `<@${
          lottery.members[winnerIndex]
        }> получает ${separateThousandth(lottery.prize.toString())}:cookie:!`,
        image: {
          url:
            'https://media1.tenor.com/images/757adf1f06b3ffd328339b1b9401db44/tenor.gif',
        },
      },
    }
  );

  return true;
};
