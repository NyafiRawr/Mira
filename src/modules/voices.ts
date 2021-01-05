import VoiceTime from '../models/VoiceTime';
import * as users from './users';
import { client } from '../client';
import { log } from '../logger';
import { VoiceState } from 'discord.js';

export const get = async (
  serverId: string,
  userId: string
): Promise<VoiceTime | null> =>
  VoiceTime.findOne({
    where: { userId, serverId },
  });

export const add = async (
  serverId: string,
  userId: string
): Promise<VoiceTime> => {
  const vt = await get(serverId, userId);

  if (!vt) {
    return VoiceTime.create({
      userId,
      serverId,
      entryTime: Date.now(),
    });
  }

  return vt.update({ entryTime: Date.now() });
};

export const remove = async (
  serverId: string,
  userId: string
): Promise<void> => {
  const vt = await get(serverId, userId);
  if (vt) {
    vt.destroy();
  }
};

// Вычисляет время и удаляет запись о нахождении в голосе
const calculate = async (serverId: string, userId: string) => {
  const vt = await get(serverId, userId);
  if (vt) {
    const newTime = (Date.now() - parseInt(vt.entryTime, 10)) / 1000;
    const user = await users.get(serverId, userId);
    await user.update({
      voiceSeconds: user.voiceSeconds + newTime,
    });
    await vt.destroy();
  }
};

export const recVoiceTime = async (
  oldState: VoiceState,
  newState: VoiceState
): Promise<void> => {
  if (oldState.channel == undefined && newState.channel) {
    await add(newState.guild!.id, newState.member!.id);
  } else if (oldState.channel && newState.channel == undefined) {
    await calculate(oldState.guild!.id, oldState.member!.id);
  }
};

export const rescueVoiceTime = async () => {
  log.info('[Время в голосе] Проверяю базу данных и пересчитываю время...');

  const vts = await VoiceTime.findAll();
  vts.map(async (vt) => {
    const { serverId, userId } = vt;
    await calculate(serverId, userId);
  });

  client.guilds.cache.map((guild) => {
    guild.voiceStates.cache.map(async (voiceState) => {
      await add(guild.id, voiceState.member!.id);
    });
  });

  log.info('[Время в голосе] Вычислительные процессы восстановлены');
};
