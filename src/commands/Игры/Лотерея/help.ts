import { Message } from 'discord.js';
import config from '../../../config';

export const help = async (message: Message) => {
    await message.channel.send({
        embed: {
            color: config.games.lottery.color,
            author: {
                name: 'Лотерея',
            },
            fields: [
                {
                    name: 'Команды',
                    value:
                        `\`${config.discord.prefix}lot create <ставка> [кол-во участников] [@,@,...]\` - создать` +
                        `\n\`${config.discord.prefix}lot final\` - определить победителя` +
                        `\n\`${config.discord.prefix}lot close\` - закрыть и вернуть себе :cookie:` +
                        `\n\`${config.discord.prefix}lot info\` - узнать больше` +
                        `\n\`${config.discord.prefix}lot join\` - присоединиться`,
                    inline: false,
                },
                {
                    name: 'Настройка',
                    value: `\`${config.discord.prefix}lot maxmembers <кол-во>\` - изменить предел участников`,
                    inline: false,
                },
            ],
        },
    });
};
