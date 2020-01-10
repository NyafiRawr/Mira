import User from '../models/user';

export const get = async <T = User>(
  serverId: string,
  userId: string
): Promise<T | null> => {
  const user = await User.findOne({
    where: {
      id: userId,
      serverId,
    },
  });

  return user as any;
};

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
