import DonateRoles from '../models/shop';

export const get = async <T = DonateRoles>(
  serverId: string,
  roleId: string
): Promise<T | null> =>
  DonateRoles.findOne({
    where: { roleId, serverId },
  }) as any;

export const getAll = async (serverId: string) => {
  const shop = await DonateRoles.findAll({
    where: {
      serverId,
    },
  });

  return shop.map((v: any) => v.dataValues);
};

export const set = async (
  serverId: string,
  roleId: string,
  cost: number = 0
) => {
  const role = await get(serverId, roleId);

  if (role !== null) {
    return role.update({
      cost,
    });
  }

  return DonateRoles.create({
    roleId,
    serverId,
    cost,
  });
};

export const remove = async (serverId: string, roleId: string) => {
  const role = await get(serverId, roleId);

  if (role !== null) {
    role.destroy();
  }
};
