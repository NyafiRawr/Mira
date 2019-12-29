import Shop from '../models/shop';

export const get = async (serverId, roleId) => Shop.findOne({
  where: { roleId, serverId },
});

export const getAll = async (serverId) => {
  const shop = await Shop.findAll({
    where: {
      serverId,
    },
  });

  return shop.map((v) => v.dataValues);
};

export const set = async (serverId, roleId, cost = 0) => {
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

export const remove = async (serverId, roleId) => {
  const role = await get(serverId, roleId);

  if (role != null) {
    role.destroy();
  }
};
