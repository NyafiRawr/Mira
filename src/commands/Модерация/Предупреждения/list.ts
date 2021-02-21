import { Message, MessageEmbed } from 'discord.js';
import * as punches from '../../../modules/mutes';
import { timeFomattedDMYHHMMSS } from '../../../utils';

export const list = async (message: Message) => {
    const victim = message.mentions.members?.first() || message.member!;
    const list = await punches.getWarns(message.guild!.id, victim.id);

    const embed = new MessageEmbed({
        color: victim.displayColor,
        author: {
            name: `Список предупреждений ${victim.displayName} (${list.length})`,
        },
    });

    if (list.length === 0) {
        embed.setTitle('Пусто');
    } else {
        embed.setFooter(`Отображаются последние 25 предупреждений`);
        for await (const warn of list.slice(0, 25)) {
            embed.addField(
                `${timeFomattedDMYHHMMSS(warn.date.getTime())} | ID: ${
                    warn.id
                }`,
                `Модератор: <@${warn.executorId}> | Канал: ${warn.channelName}` +
                    `\nПричина: ${warn.reason}`,
                false
            );
        }
    }

    return message.channel.send(embed);
};
