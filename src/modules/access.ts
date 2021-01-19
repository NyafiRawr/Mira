import Access from '../models/Access';

export const getAll = async (serverId: string): Promise<Access[]> =>
  Access.findAll({
    where: { serverId },
  });

export const getOne = async (
  serverId: string,
  channelId: string | null,
  commandName: string | null
): Promise<Access | null> => {
  const denyByServer = await Access.findOne({
    where: { serverId, channelId: null, commandName },
  });
  if (denyByServer !== null) {
    return denyByServer;
  }

  const denyByChannel = await Access.findOne({
    where: { serverId, channelId, commandName: null },
  });
  if (denyByChannel !== null) {
    return denyByChannel;
  }

  const denyByCommandInChannel = await Access.findOne({
    where: { serverId, channelId, commandName },
  });
  if (denyByCommandInChannel !== null) {
    return denyByCommandInChannel;
  }

  return null;
};

export const check = async (
  serverId: string,
  channelId: string | null,
  commandName: string | null
): Promise<boolean> => {
  const deny = await getOne(serverId, channelId, commandName);
  if (deny !== null) {
    return true;
  }
  return false;
};

export const set = async (
  serverId: string,
  channelId: string | null,
  commandName: string | null
): Promise<Access> => {
  const deny = await getOne(serverId, channelId, commandName);

  if (deny !== null) {
    throw new Error('такая команда уже запрещена.');
  }

  return Access.create({ serverId, channelId, commandName });
};

export const remove = async (
  serverId: string,
  channelId: string | null,
  commandName: string | null
): Promise<boolean> => {
  const deny = await getOne(serverId, channelId, commandName);

  if (deny) {
    await deny.destroy();
    return true;
  }

  return false;
};
