import Voice from '../models/voice';

export const get = async (
  serverId: string
): Promise<Voice | null> =>
  Voice.findOne({
    where: { serverId },
  });

export const set = async (
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

export const remove = async (
  serverId: string
) =>
  Voice.destroy({
    where: { serverId }
  });
