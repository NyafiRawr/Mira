import User from '../models/user';

export const get = async (
  serverId: string,
  userId: string
): Promise<User | null> =>
  User.findOne({
    where: {
      id: userId,
      serverId,
    },
  });

  export const getAll = async (
    serverId: string,
  ): Promise<User[] | null> =>
    User.findAll({
      where: {
        serverId,
      },
    });

export const set = async (
  serverId: string,
  userId: string,
  fields: { [key: string]: any }
) => {
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
