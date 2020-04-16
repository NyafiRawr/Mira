import Guild from '../models/guild';

export const gets = async (
  serverId: string
): Promise<Guild[] | null> => Guild.findAll({
  where: {
    serverId
  },
});

export const owner = async (
  serverId: string,
  ownerId: string
): Promise<Guild | null> => Guild.findOne({
  where: {
    serverId,
    ownerId
  },
});

export const member = async (
  serverId: string,
  ownerId: string
): Promise<Guild | null> => Guild.findOne({
  where: {
    serverId,
    ownerId
  },
});

export const create = async (
  serverId: string,
  ownerId: string,
  fields: { [key: string]: any }
): Promise<Guild> => {
  const find = await Guild.findOne({
    where: { serverId, ownerId },
  });

  if (find !== null) {
    return find.update(fields);
  }

  return Guild.create({
    serverId,
    ownerId,
    ...fields,
  });
};

export const remove = async (
  serverId: string,
  ownerId: string
) =>
  Guild.destroy({
    where: { serverId, ownerId },
  });
