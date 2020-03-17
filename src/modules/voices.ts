import Voice from '../models/voice';
import * as Keyv from 'keyv';

export const getSettings = async (
  serverId: string
): Promise<Voice | null> =>
  Voice.findOne({
    where: { serverId },
  });

export const setSettings = async (
  serverId: string,
  fields: { [key: string]: any }
): Promise<Voice> => {
  const voiceFind = await Voice.findOne({
    where: { serverId },
  });

  if (voiceFind !== null) {
    return voiceFind.update(fields);
  }

  return Voice.create({
    serverId,
    ...fields,
  });
};

export const removeSettings = async (
  serverId: string
) =>
  Voice.destroy({
    where: { serverId }
  });

const voices = new Keyv({ namespace: 'voice' });

export const getVoiceId = async (
  serverId: string,
  userId: string
): Promise<string | null> => voices.get(`${serverId}_${userId}`);

export const deleteVoiceId = async (
  serverId: string,
  userId: string
) => voices.delete(`${serverId}_${userId}`);

export const setVoiceId = async (
  serverId: string,
  userId: string,
  voiceId: string
) => voices.set(`${serverId}_${userId}`, voiceId);
