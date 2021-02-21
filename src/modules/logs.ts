import {
    Guild,
    User,
    Message,
    PartialMessage,
    Collection,
    GuildMember,
    PartialGuildMember,
    TextChannel,
    MessageEmbed,
} from 'discord.js';
import { timeFomattedDMYHHMMSS } from '../utils';
import * as vars from './vars';

export const getLogsChannelId = async (
    serverId: string
): Promise<string | null> => {
    const channelId = await vars.getOne(serverId, 'logs_channel_id');
    return channelId?.value || null;
};

export const setLogsChannelId = async (
    serverId: string,
    channelId: string | null
): Promise<void> => {
    if (channelId === null) {
        await vars.remove(serverId, 'logs_channel_id');
    } else {
        await vars.set(serverId, 'logs_channel_id', channelId);
    }
};

export const logKick = async (member: GuildMember | PartialGuildMember) => {
    const channelId = await getLogsChannelId(member.guild.id);
    if (channelId === null) {
        return;
    }
    const channel = member.guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    // Последняя запись в журнале аудита должна быть логом о кике
    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
    });

    const kickLog = fetchedLogs.entries.first();
    if (!kickLog) {
        return; // Случай когда за последнее время киков не было совсем
    }

    const { executor, target, reason } = kickLog;

    // Проверяем, что лог создан не больше 5 секунд назад
    // 1 вар: kickLog.createdAt < member.joinedAt, но:
    // "joinedAt может быть null, если данные о пользователе не получены"
    // 2 вар: Date.now() - kickLog.createdTimestamp > 5000
    if (member.joinedAt !== null && kickLog.createdAt < member.joinedAt) {
        return; // Случай когда нам попался старый лог о кике
    }

    const kickMember = target as User;
    if (kickMember.id === member.id) {
        await (channel as TextChannel).send({
            embed: {
                color: '#800040',
                description: `Участник **${member.displayName}** (${member}) был кикнут`,
                fields: [
                    { name: 'Модератор', value: executor, inline: true },
                    {
                        name: 'Причина',
                        value: reason || 'Не указана',
                        inline: true,
                    },
                ],
                footer: { text: `${member.displayName} ID: ${member.id}` },
            },
        });
    }
};

export const logBanAdd = async (guild: Guild, user: User) => {
    const channelId = await getLogsChannelId(guild.id);
    if (channelId === null) {
        return;
    }
    const channel = guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    const ban = await guild.fetchBan(user);
    await (channel as TextChannel).send({
        embed: {
            color: '#ff0000',
            description: `Участник **${user.tag}** (${user}) был забанен`,
            fields: [
                {
                    name: 'Причина',
                    value: ban.reason || 'Не указана',
                    inline: true,
                },
            ],
            footer: { text: `${user.username} ID: ${user.id}` },
        },
    });
};

export const logBanRemove = async (guild: Guild, user: User) => {
    const channelId = await getLogsChannelId(guild.id);
    if (channelId === null) {
        return;
    }
    const channel = guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    await (channel as TextChannel).send(`User ${user.tag} (${user}) unbanned.`);
    await (channel as TextChannel).send({
        embed: {
            color: '#ffffff',
            description: `Участник **${user.tag}** (${user}) был разбанен`,
            footer: { text: `${user.username} ID: ${user.id}` },
        },
    });
};

export const logMessageDelete = async (message: Message | PartialMessage) => {
    if (
        message.guild === null || // Игнорируем ЛС
        message.partial // Удалено сообщение, которого не было в кэше, нет никаких данных
    ) {
        return;
    }

    const channelId = await getLogsChannelId(message.guild.id);
    if (channelId === null || channelId === message.channel.id) {
        return;
    }
    const channel = message.guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 'MESSAGE_DELETE',
    });

    const deletionLog = fetchedLogs.entries.first();
    if (deletionLog !== undefined) {
        const { executor, target } = deletionLog;

        const deletionMember = target as User;
        if (deletionMember.id === message.author?.id) {
            return (channel as TextChannel).send({
                embed: {
                    color: '#800000',
                    description: `Сообщение участника **${
                        message.member?.displayName || message.author?.tag
                    }** (${message.author}) в канале ${
                        message.channel
                    } было удалено`,
                    fields: [
                        {
                            name: 'Текст',
                            value: message.content?.slice(0, 1024) || '-',
                            inline: false,
                        },
                        { name: 'Модератор', value: executor, inline: true },
                        {
                            name: 'Вложенные файлы',
                            value:
                                message.attachments
                                    .map(
                                        (attach, index) =>
                                            `[${index + 1}](${attach.url})`
                                    )
                                    .join(', ')
                                    .slice(0, 1024) || 'Нет',
                            inline: true,
                        },
                        {
                            name: 'Есть Embed?',
                            value: message.embeds.length ? 'Да' : 'Нет',
                            inline: true,
                        },
                    ],
                    footer: {
                        text: `Сообщение создано: ${timeFomattedDMYHHMMSS(
                            message.createdAt.getTime()
                        )}`,
                    },
                },
            });
        }
    }

    return (channel as TextChannel).send({
        embed: {
            color: '#e80000',
            description: `Участник **${
                message.member?.displayName || message.author?.tag
            }** (${message.author}) удалил своё сообщение из канала ${
                message.channel
            }`,
            fields: [
                {
                    name: 'Текст',
                    value: message.content?.slice(0, 1024) || '-',
                    inline: false,
                },
                {
                    name: 'Вложенные файлы',
                    value:
                        message.attachments
                            .map(
                                (attach, index) =>
                                    `[${index + 1}](${attach.url})`
                            )
                            .join(', ')
                            .slice(0, 1024) || 'Нет',
                    inline: true,
                },
                {
                    name: 'Есть Embed?',
                    value: message.embeds.length ? 'Да' : 'Нет',
                    inline: true,
                },
            ],
            footer: {
                text: `Сообщение создано: ${timeFomattedDMYHHMMSS(
                    message.createdAt.getTime()
                )}`,
            },
        },
    });
};

export const logMessageBulk = async (
    messages: Collection<string, Message | PartialMessage>
) => {
    const msg = messages.first()!;
    if (msg.guild === null) {
        return;
    }

    const channelId = await getLogsChannelId(msg.guild.id);
    if (channelId === null || channelId === msg.channel.id) {
        return;
    }
    const channel = msg.guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    messages.map(async (message, index) => {
        await (channel as TextChannel).send({
            embed: {
                color: '#800000',
                description: `Было удалено **${
                    messages.size
                } сообщений** из канала ${
                    message.channel
                }. Автор сообщения **№${index + 1}: ${
                    message.member?.displayName || message.author?.tag
                }** (${message.author})`,
                fields: [
                    {
                        name: 'Текст',
                        value: message.content?.slice(0, 1024) || '-',
                        inline: false,
                    },
                    {
                        name: 'Вложенные файлы',
                        value:
                            message.attachments
                                .map(
                                    (attach, index) =>
                                        `[${index + 1}](${attach.url})`
                                )
                                .join(', ')
                                .slice(0, 1024) || 'Нет',
                        inline: true,
                    },
                ],
                footer: {
                    text: `Сообщение создано: ${timeFomattedDMYHHMMSS(
                        message.createdAt.getTime()
                    )}`,
                },
            },
        });
    });
};

export const logMessageUpdate = async (
    messageOld: Message | PartialMessage,
    messageNew: Message | PartialMessage
) => {
    if (messageOld.editedAt === messageNew.editedAt) {
        return; // Сообщения отредактированные дискордом (встраивание ссылок)
    }

    if (messageNew.partial) {
        messageNew = await messageNew.fetch();
    }

    if (messageNew.guild === null || messageNew.author.bot) {
        return;
    }

    const channelId = await getLogsChannelId(messageNew.guild.id);
    if (channelId === null || channelId === messageOld.channel.id) {
        return;
    }
    const channel = messageNew.guild.channels.cache.get(channelId);
    if (channel === undefined) {
        return;
    }

    const embed = new MessageEmbed({
        color: '#80ffff',
        description: `Участник **${
            messageOld.member?.displayName || messageOld.author?.tag
        }** (${messageOld.author}) отредактировал сообщение в канале ${
            messageOld.channel
        }`,
        footer: {
            text: `Сообщение создано: ${timeFomattedDMYHHMMSS(
                messageNew.createdAt.getTime()
            )}`,
        },
    });

    if (messageOld.content) {
        embed.addField('Было', messageOld.content.slice(0, 1024), false);
    }

    if (messageNew.content) {
        embed.addField('Стало', messageNew.content.slice(0, 1024), false);
    }

    if (messageOld.attachments.size) {
        embed.addField(
            'Вложенные файлы',
            messageOld.attachments
                .map((attach, index) => `[${index + 1}](${attach.url})`)
                .join(', '),
            true
        );
    }

    if (messageOld.embeds.length) {
        embed.addField(
            'Есть Есть Embed?',
            messageOld.embeds !== messageNew.embeds ? 'Да' : 'Нет',
            true
        );
    }

    await (channel as TextChannel).send(embed);
};
