import Shop from '../models/shop';

export const get = async (serverId: string, roleId: string) => Shop.findOne({
  where: { roleId, serverId },
});

export const getAll = async (serverId: string) => {
  const shop = await Shop.findAll({
    where: {
      serverId,
    },
  });

  return shop.map((v: any) => v.dataValues);
};

export const set = async (serverId: string, roleId: string, cost = 0) => {
  const role = await get(serverId, roleId);

  if (role != null) {
    return role.update({
      cost,
    });
  }

  return Shop.create({
    roleId,
    serverId,
    cost,
  });
};

export const remove = async (serverId: string, roleId: string) => {
  const role = await get(serverId, roleId);

  if (role != null) {
    role.destroy();
  }
};
