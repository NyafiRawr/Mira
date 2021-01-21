import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import * as punches from '../../../modules/mutes';

export const list = async (message: Message) => {
  const victim = message.mentions.users.first() || message.author;
  const list = await punches.getWarns(message.guild!.id, victim.id);

  const embed = new MessageEmbed({
    color: config.colors.message,
    author: {
      name: `Список предупреждений ${victim.tag}`,
    },
  });

  if (list.length === 0) {
    embed.setTitle('Ничего нет');
  } else {
    for await (const warn of list.slice(0, 25)) {
      embed.addField(
        warn.date,
        `Причина: ${warn.reason || 'Не указана'}` +
          `\nКанал: ${warn.channelName}>` +
          `\nМодератор: <@${warn.executorId}>`
      );
    }
  }

  return message.channel.send(embed);
};
