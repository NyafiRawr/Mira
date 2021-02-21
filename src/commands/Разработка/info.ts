import { Message, MessageEmbed } from 'discord.js';
import { timeFomattedDHMS, roundDecimalPlaces } from '../../utils';
import config from '../../config';

const body = {
    color: config.colors.info,
    author: {
        name: 'Создана с использованием DiscordJS',
        url: 'https://i.imgur.com/wSTFkRM.png',
    },
    title: 'Задать вопрос на сервере создателя',
    url: config.author.discord.invite,
    description:
        `Создатель: **${config.author.discord.nickname}**. **Спасибо** тем, кто помогал и предлагал идеи, в том числе: **MrGolden, Mrrriooow**, а так же отдельное спасибо: **` +
        config.packageJson.contributors
            .map((contributor: string) => contributor)
            .join(', ') +
        '**',
    fields: [
        {
            name: 'Хостинг',
            value: `[${config.hosting.name}](${config.hosting.url})`,
            inline: true,
        },
        {
            name: 'Версия',
            value: `[${config.packageJson.version}](https://github.com/${config.author.discord.nickname}/${config.packageJson.name})`,
            inline: true,
        },
        { name: 'Префикс', value: config.discord.prefix, inline: true },
    ],
};

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: `Информация обо мне`,
    aliases: ['about', 'version'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    execute(message: Message) {
        const embed = new MessageEmbed(body);
        message.channel.send(
            embed
                .addField(
                    'Сервера',
                    `${message.client.guilds.cache.size} из 100`,
                    true
                )
                .addField(
                    'Время работы',
                    timeFomattedDHMS(message.client.uptime || 0),
                    true
                )
                .addField(
                    'Занято ОЗУ',
                    roundDecimalPlaces(
                        process.memoryUsage().heapUsed / 8e6,
                        0
                    ) +
                        ' / ' +
                        roundDecimalPlaces(process.memoryUsage().rss / 8e6, 0) +
                        ' МБ',
                    true
                )
        );
    },
};
