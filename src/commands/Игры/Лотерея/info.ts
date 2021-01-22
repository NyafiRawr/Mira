import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { separateThousandth } from '../../../utils';
import * as lots from '../../../modules/lots';

export const info = async (message: Message) => {
  const lottery = await lots.get(message.guild!.id);

  const embed = new MessageEmbed({
    color: config.games.lottery.color,
    author: {
      name: 'Лотерея',
    },
  });
  if (lottery === null) {
    embed.setTitle('Ничего не проводится');
  } else {
    const members = lottery.memberIds.split(',');
    embed
      .setTitle(
        `Розыгрыш: ${separateThousandth(lottery.prize.toString())}:cookie:`
      )
      .setDescription(
        `Организатор: <@${lottery.userId}>` +
          `\nУчастники: ${members.length}/${lottery.membersWaitCount}`
      );
    if (members.some((id) => message.author.id === id)) {
      embed.setFooter('Ты принял участие в этой лотерее');
    } else {
      embed.setFooter(`Участвовать: ${config.discord.prefix}lottery join`);
    }
  }

  await message.channel.send({ embed });
};
