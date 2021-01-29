import User from '../models/User';

// Возвращает массив пользователей, может быть пустым
export const all = async (serverId: string): Promise<User[]> =>
  User.findAll({
    where: {
      serverId,
    },
  });

// Возвращает указанного пользователя (создаёт, если нет)
export const get = async (serverId: string, userId: string): Promise<User> => {
  const user = await User.findOne({
    where: {
      id: userId,
      serverId,
    },
  });
  if (user == null) {
    return User.create({ serverId, id: userId });
  }
  return user;
};

// Создаёт пользователя и записывает указанные параметры
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const set = async (serverId: string, userId: string, fields: any) => {
  return await (await get(serverId, userId)).update(fields);
};
