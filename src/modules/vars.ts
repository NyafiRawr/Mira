import Var from '../models/var';
// TODO: навести порядок
export const get = async <T = any>(
  serverId: string,
  name: string,
  def?: T
): Promise<T> => {
  const res = await Var.findOne({
    where: { name, serverId },
  });

  return (JSON.parse(res?.value || 'false') as any) || def;
};

export const getAll = async (serverId: string): Promise<Var[]> =>
  Var.findAll({
    where: { serverId },
  });

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
