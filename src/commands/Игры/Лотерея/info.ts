import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { separateThousandth } from '../../../utils';
import { lots } from '../lot';

export const info = async (message: Message) => {
  const lottery = lots.get(message.guild!.id);

  const embed = new MessageEmbed({
    color: config.games.lottery.color,
    author: {
      name: 'Лотерея',
    },
  });
  if (lottery === undefined) {
    embed.setTitle('Ничего не проводится');
  } else {
    embed
      .setTitle(
        `Розыгрыш: ${separateThousandth(lottery.prize.toString())}:cookie:`
      )
      .setDescription(
        `Организатор: <@${lottery.authorId}>` +
          `\nУчастники: ${lottery.members.length}/${lottery.membersMaxCount}`
      );
    if (lottery.members.some((id) => message.author.id === id)) {
      embed.setFooter('Ты принял участие в этой лотерее');
    } else {
      embed.setFooter(`Участвовать: ${config.discord.prefix}lottery join`);
    }
  }

  await message.channel.send({ embed });
};
