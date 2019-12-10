import Shop from '../models/catalog_role';


///Какой то функционал для БДшки

export const get = async (serverId, roleId) => {
  const role = await Shop.findOne({
    where: {
      roleId,
      serverId,
    },
  });
  return role;
};

export const getall = async (serverId) => {
  return Shop.findAll({
    where: {
      serverId,
    },
  });
};
  
export const set = async (serverId, roleId, roleCost, fields) => {
  const role = await get(serverId, roleId);
  if (role != null) {
      return role.update({
          roleCost: roleCost,
      });
  }

  return Shop.create({
      roleId,
      serverId,
      roleCost,
      ...fields,
  });
};
  
export const del = async (serverId, roleId) => {

  const role = await get(serverId, roleId);
  
  if (role != null) {
    role.destroy();
    return true;
  }

  return false;
};