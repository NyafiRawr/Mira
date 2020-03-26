import Guild from '../models/guild';

export const get = async (serverId: string, guildId: string | null = null): Promise<Guild | null> =>
  Guild.findOne({
    where: {
      serverId
    },
  });

export const set = async (
  serverId: string,
  guildId: string | null = null,
  fields: { [key: string]: any }
): Promise<Guild> => {
  const find = await Guild.findOne({
    where: { serverId },
  });

  if (find !== null) {
    return find.update(fields);
  }

  return Guild.create({
    serverId,
    ...fields,
  });
};

export const remove = async (serverId: string) =>
  Guild.destroy({
    where: { serverId },
  });
