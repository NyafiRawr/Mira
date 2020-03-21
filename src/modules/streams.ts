import Stream from '../models/stream';

export const get = async (serverId: string): Promise<Stream | null> =>
  Stream.findOne({
    where: { serverId },
  });

export const set = async (
  serverId: string,
  fields: { [key: string]: any }
): Promise<Stream> => {
  const find = await Stream.findOne({
    where: { serverId },
  });

  if (find !== null) {
    return find.update(fields);
  }

  return Stream.create({
    serverId,
    ...fields,
  });
};

export const remove = async (serverId: string) =>
  Stream.destroy({
    where: { serverId },
  });
