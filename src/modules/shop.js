import Shop from '../models/shop';

export const get = async (serverId, roleId = null) => {
  let shop;

  if (roleId) {
    shop = await Shop.findOne({
      where: {
        roleId,
        serverId,
      },
    });
  } else {
    shop = await Shop.findAll({
      where: {
        serverId,
      },
    });
    for (let i = 0; i < shop.length; i += 1) {
      shop[i] = shop[i].dataValues;
    }
  }

  return shop;
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
