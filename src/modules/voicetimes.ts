import VoiceTime from '../models/VoiceTime';
import * as users from './users';
import { client } from '../client';
import { log } from '../logger';
import { VoiceState } from 'discord.js';

//#region Время проведенное в голосовом чате

// Поиск записи времени входа пользователя в голосовой чат
export const getTimeEntry = async (
    serverId: string,
    userId: string
): Promise<VoiceTime | null> =>
    VoiceTime.findOne({
        where: { userId, serverId },
    });

// Запись времени входа в голосовой чат
export const addTimeEntry = async (
    serverId: string,
    userId: string
): Promise<VoiceTime> => {
    const rvt = await getTimeEntry(serverId, userId);

    if (rvt === null) {
        return VoiceTime.create({
            userId,
            serverId,
            entryTime: Date.now(),
        });
    }

    return rvt.update({ entryTime: Date.now() });
};

// Удаление записи
export const removeTimeEntry = async (
    serverId: string,
    userId: string
): Promise<void> => {
    const vt = await getTimeEntry(serverId, userId);
    if (vt) {
        vt.destroy();
    }
};

// Вычисляет проведенное в голосовом чате время и удаляет запись об этом
const calculateVoiceTimeByRecord = async (rvt: VoiceTime) => {
    const newTime = (Date.now() - rvt.entryTime) / 1000;
    const user = await users.get(rvt.serverId, rvt.userId);
    await user.update({
        voiceSeconds: user.voiceSeconds + newTime,
    });
    await rvt.destroy();
};

// Проверка VoiceState: если зашёл - сделать запись, если вышел - вычислить время
export const writeVoiceTime = async (
    oldState: VoiceState,
    newState: VoiceState
): Promise<void> => {
    if (oldState.channel === null && newState.channel !== null) {
        await addTimeEntry(newState.guild!.id, newState.member!.id);
    } else if (oldState.channel !== null && newState.channel === null) {
        const rvt = await getTimeEntry(oldState.guild!.id, oldState.member!.id);
        if (rvt) {
            await calculateVoiceTimeByRecord(rvt);
        }
    }
};

// Перезапись времени проведенного и проводимого в голосовых чатах пользователями
export const rewriteVoiceTime = async () => {
    log.info('[Время в голосе] Проверяю базу данных и пересчитываю время...');

    const rvts = await VoiceTime.findAll();

    for await (const rvt of rvts) {
        await calculateVoiceTimeByRecord(rvt);
    }

    for await (const [, guild] of client.guilds.cache) {
        for await (const [, voiceState] of guild.voiceStates.cache) {
            await addTimeEntry(guild.id, voiceState.member!.id);
        }
    }

    log.info('[Время в голосе] Вычислительные процессы восстановлены');
};

//#endregion
