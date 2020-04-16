import Var from '../models/var';

export const get = async <T = any>(
  serverId: string,
  name: string,
  define?: T
): Promise<T> => {
  const res = await Var.findOne({
    where: { name, serverId },
  });

  return (JSON.parse(res?.value || 'false') as any) || define;
};

export const set = async (
  serverId: string,
  name: string,
  value: any
): Promise<Var> => {
  const variable = await Var.findOne({
    where: { name, serverId },
  });

  if (variable != null) {
    return variable.update({
      name,
      value: JSON.stringify(value),
    });
  }

  return Var.create({
    serverId,
    name,
    value: JSON.stringify(value),
  });
};

export const remove = async (serverId: string, name: string) =>
  Var.destroy({
    where: {
      serverId,
      name,
    },
    truncate: true,
  });
