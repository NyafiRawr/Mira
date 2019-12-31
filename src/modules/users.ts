import User from '../models/user';

export const get = async (serverId: string, userId: string) => {
  const user = await User.findOne({
    where: {
      id: userId,
      serverId,
    },
  });
  return user;
};

export const set = async (serverId: string, userId: string, fields: Object) => {
  const user = await get(serverId, userId);
  if (user != null) {
    return user.update(fields);
  }
  return User.create({
    id: userId,
    serverId,
    ...fields,
  });
};
