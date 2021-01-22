import { Message } from 'discord.js';
import config from '../../../config';
import { randomInteger, separateThousandth } from '../../../utils';
import * as economy from '../../../modules/economy';
import Lottery from '../../../models/Lottery';

export const check = async (
  message: Message,
  lottery: Lottery
): Promise<boolean> => {
  const members = lottery.memberIds.split(',');
  if (members.length !== lottery.membersWaitCount) {
    return false;
  }

  await lottery.destroy();

  const winnerIndex = randomInteger(0, lottery.membersWaitCount - 1);

  await economy.setBalance(
    message.guild!.id,
    members[winnerIndex],
    lottery.prize
  );

  const winner =
    (await message
      .guild!.members.fetch(members[winnerIndex])
      .catch(() => undefined)
      .then((member) => member?.displayName)) || `<@${members[winnerIndex]}>`;

  await message.channel.send(
    `<@${members[winnerIndex]}> победил в лотерее от <@${
      lottery.userId
    }>! ${members
      .filter((_id, index) => index !== winnerIndex)
      .map((id) => `<@${id}>`)
      .join(', ')}`,
    {
      embed: {
        color: config.games.lottery.color,
        title: 'Лотерея завершена!',
        description: `**${winner} забирает ${separateThousandth(
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
