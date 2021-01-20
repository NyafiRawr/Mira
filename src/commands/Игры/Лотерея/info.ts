import { Message } from 'discord.js';
import config from '../../../config';
import { separateThousandth } from '../../../utils';
import { lots } from '../lot';

export const info = async (message: Message) => {
  const lottery = lots.get(message.guild!.id);

  let embed;
  if (lottery === undefined) {
    embed = {
      color: config.games.lottery.color,
      author: {
        name: 'Лотерея',
      },
      title: 'Ничего не проводится',
    };
  } else {
    embed = {
      color: config.games.lottery.color,
      author: {
        name: 'Лотерея',
      },
      title: `Розыгрыш: ${separateThousandth(
        lottery.prize.toString()
      )}:cookie:`,
      description:
        `Организатор: <@${lottery.authorId}>` +
        `\nУчастники: ${lottery.members.length}/${lottery.membersMaxCount}`,
      footer: {
        text: `Участвовать: ${config.discord.prefix}lottery join`,
      },
    };
  }

  await message.channel.send({ embed });
};
