import Vars from '../models/vars';

export const get = async <T = any>(
  serverId: string,
  name: string,
  def?: T,
): Promise<T> => {
  const res = await Vars.findOne({
    where: { name, serverId },
  });

  return JSON.parse(res?.value || 'false') as any || def;
};

export const getAll = async(
  serverId: string,
): Promise<Vars[]> =>
  Vars.findAll({
    where: { serverId },
  });

export const set = async (
  serverId: string,
  name: string,
  value: any,
): Promise<Vars> => {
  const varible = await Vars.findOne({
    where: { name, serverId },
  });

  if (varible != null) {
    return varible.update({
      name,
      value: JSON.stringify(value),
    });
  }

  return Vars.create({
    serverId,
    name,
    value: JSON.stringify(value),
  });
};

export const remove = async (serverId: string, name: string) =>
  Vars.destroy({
    where: {
      serverId,
      name,
    },
    truncate: true
  });
