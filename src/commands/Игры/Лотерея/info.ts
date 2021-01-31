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
    const members = await lots.getMembers(lottery.id);

    embed
      .setTitle(
        `Розыгрыш: ${separateThousandth(lottery.prize.toString())}:cookie:`
      )
      .setDescription(
        `Организатор: <@${lottery.userId}>` +
          `\nУчастники: ${members.length}/${lottery.membersWait}`
      );

    if (members.some((member) => member.userId === message.author.id)) {
      embed.setFooter('Ты участвуешь в этой лотерее');
    } else {
      embed.setFooter(`Участвовать: ${config.discord.prefix}lot join`);
    }
  }

  await message.channel.send({ embed });
};
