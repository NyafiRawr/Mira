import Access from '../models/Access';

export const getAll = async (serverId: string): Promise<Access[]> =>
  Access.findAll({
    where: { serverId },
  });

export const getAllByChannel = async (
  serverId: string,
  channelId: string
): Promise<Access[]> =>
  Access.findAll({
    where: { serverId, channelId },
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
    throw new Error('такой запрет уже есть.');
  }

  if (channelId !== null && commandName === null) {
    await removeByChannel(serverId, channelId);
  }

  return Access.create({ serverId, channelId, commandName });
};

export const removeByCommand = async (
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

export const removeByChannel = async (
  serverId: string,
  channelId: string
): Promise<boolean> => {
  const denyByChannels = await getAllByChannel(serverId, channelId);

  if (denyByChannels.length) {
    for await (const denyByChannel of denyByChannels) {
      await denyByChannel.destroy();
    }
    return true;
  }

  return false;
};

export const removeByServer = async (serverId: string): Promise<boolean> => {
  const denyByServers = await Access.findAll({
    where: { serverId, channelId: null },
  });

  if (denyByServers.length) {
    for await (const denyByServer of denyByServers) {
      await denyByServer.destroy();
    }
    return true;
  }

  return false;
};
