import { Message } from 'discord.js';
import config from '../../config';
import * as logs from '../../modules/logs';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description:
        'Запись удаленных и редактированных сообщений, а так же кик, бан, разбан',
    permissions: ['ADMINISTRATOR'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        switch (args.shift()) {
            case 'set': {
                if (!message.member?.hasPermission(this.permissions[0])) {
                    throw new Error(
                        `необходима глобальная привилегия ${this.permissions[0]}.`
                    );
                }

                if (message.mentions.channels.size) {
                    const channel = message.mentions.channels.first()!;
                    await logs.setLogsChannelId(message.guild!.id, channel.id);
                    return message.reply(
                        `канал ${channel.name} установлен, как канал для записи логов - логгирование включено.`
                    );
                } else {
                    await logs.setLogsChannelId(message.guild!.id, null);
                    return message.reply(
                        `канал записи логов удален, логгирование отключено.`
                    );
                }
            }
            default: {
                const channelId = await logs.getLogsChannelId(
                    message.guild!.id
                );
                return message.channel.send({
                    embed: {
                        color: config.colors.message,
                        author: {
                            name: 'Логгирование событий',
                        },
                        title: channelId === null ? 'Отключено' : 'Включено',
                        description: `**Канал:** ${
                            channelId === null ? 'Нет' : `<#${channelId}>`
                        }`,
                        fields: [
                            {
                                name: 'Записывает',
                                value:
                                    ' - Удаленные сообщения с момента, когда бот появился в сети' +
                                    '\n - Редактированные сообщения с момента, когда бот появился в сети' +
                                    '\n - Удаленные группы сообщений (bulk)',
                                inline: false,
                            },
                            {
                                name: 'Сообщает о',
                                value:
                                    ' - Киках' + '\n - Банах' + '\n - Разбанах',
                                inline: false,
                            },
                            {
                                name: 'Команды',
                                value: `\`${config.discord.prefix}${this.name} set [#логи]\` - установить канал и включить [или отключить]`,
                                inline: false,
                            },
                        ],
                    },
                });
            }
        }
    },
};
