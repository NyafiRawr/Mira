import {
    GuildMember,
    Snowflake,
    User,
    VoiceChannel,
    VoiceState,
} from 'discord.js';
import * as vars from './vars';
import { client } from '../client';

//#region Запись родительского канала для создания других

const keyTempVoiceCreaterId = 'temp_voice_creater_id';

export const setTempVoiceCreaterId = async (
    serverId: string,
    voiceId: string
): Promise<void> => {
    await vars.set(serverId, keyTempVoiceCreaterId, voiceId);
};

export const getTempVoiceCreaterId = async (
    serverId: string
): Promise<string | null> => {
    const variable = await vars.getOne(serverId, keyTempVoiceCreaterId);
    return variable?.value || null;
};

export const removeTempVoiceCreaterId = async (
    serverId: string
): Promise<void> => {
    await vars.remove(serverId, keyTempVoiceCreaterId);
};

//#endregion

//#region Автосоздание голосовых каналов по входу в указанный

const prefixTempVoice = '[TEMP]';

interface CustomVoiceChannel {
    owner: User;
    voice: VoiceChannel;
}

// Key: voiceId
const channels = new Map<Snowflake, CustomVoiceChannel>();

// Проходимся по каналам в гильдии и удаляем свои мертвые каналы
export const clearDeadTempChannels = async () => {
    for await (const [, guild] of client.guilds.cache) {
        guild.channels.cache
            .filter((channel) => channel.type === 'voice')
            .filter((channel) => channel.name.startsWith(prefixTempVoice))
            .forEach((channel) => channel.delete());
    }
};

// Получение канала которым владеет пользователь
const getOwnChannel = (author: User): CustomVoiceChannel => {
    const cvc = Array.from(channels.values()).find(
        (cvc) => cvc.owner.id === author.id
    );

    if (cvc == null) {
        throw new Error('у тебя нет своего голосового канала!');
    }

    return cvc;
};

export const invite = async (
    owner: User,
    member: GuildMember
): Promise<CustomVoiceChannel> => {
    if (owner.id === member.id) {
        throw new Error('нельзя пригласить самого себя.');
    }

    const cvc = getOwnChannel(owner);

    await cvc.voice.updateOverwrite(member, {
        CONNECT: true,
        SPEAK: true,
    });

    return cvc;
};

export const kick = async (
    owner: User,
    member: GuildMember
): Promise<CustomVoiceChannel> => {
    if (owner.id === member.id) {
        throw new Error('нельзя исключить самого себя.');
    }

    const cvc = getOwnChannel(owner);

    await cvc.voice.updateOverwrite(member, {
        CONNECT: false,
        SPEAK: false,
    });

    await member.voice.kick('Исключен владельцем голосового канала');

    return cvc;
};

// Заблокировать или разблокировать канал
export const changeState = async (
    author: User,
    lock: boolean
): Promise<CustomVoiceChannel> => {
    const cvc = getOwnChannel(author);

    await cvc.voice.updateOverwrite(cvc.voice.guild.roles.everyone, {
        VIEW_CHANNEL: lock === false,
    });

    return cvc;
};

// Добавляет ограничение на максимальное кол-во пользователей в канале
export const setLimit = async (
    author: User,
    limit: number
): Promise<CustomVoiceChannel> => {
    const cvc = getOwnChannel(author);
    await cvc.voice.setUserLimit(limit);
    return cvc;
};

// "Безопасное" удаление канала
export const deleteTempVoice = async (channel: VoiceChannel) => {
    channels.delete(channel.id);

    await channel.delete('Владелец вышел из своего чата');
};

// Создание голосового чата и перемещение пользователя туда
export const createTempVoice = async (
    tempVoiceCreater: VoiceChannel,
    user: GuildMember
): Promise<void> => {
    const cvc = await tempVoiceCreater.guild.channels.create(
        `${prefixTempVoice} ${user.displayName}`,
        {
            type: 'voice',
            parent: tempVoiceCreater.parent || undefined,
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                },
            ],
        }
    );

    channels.set(cvc.id, {
        owner: user.user,
        voice: cvc,
    });

    await user.voice.setChannel(cvc, 'Создал свой голосовой чат');
};

export const checkEntryInTempVoiceCreater = async (
    oldState: VoiceState,
    newState: VoiceState
) => {
    if (
        oldState.channel !== null && // Если кто-то покинул канал
        channels.get(oldState.channel.id)?.owner.id === oldState.member!.id // И это владелец покинул свой канал
    ) {
        await deleteTempVoice(oldState.channel);
    }

    // Если кто-то зашёл ...
    if (newState.channel !== null) {
        // ... в канал для создания голосовых чатов ...
        const tempVoiceCreaterId = await getTempVoiceCreaterId(
            newState.guild.id
        );
        if (newState.channelID === tempVoiceCreaterId) {
            // ... то создать чат
            await createTempVoice(newState.channel, newState.member!).catch(
                () => {
                    newState.member!.send(
                        'Не могу переместить тебя в твой канал, потому что у меня не хватает прав на это.'
                    );
                }
            );
        }
    }
};

//#endregion
