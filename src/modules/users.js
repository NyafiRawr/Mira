import User from '../models/user';

export const get = async (idServer, idUser) => {
  const user = await User.findOne({
    where: {
      id: idUser,
      idServer: idServer,
    },
  });
  return user;
};

export const set = async (idServer, idUser, fields) => {
  const user = await get(idServer, idUser);
  if (user != null) {
    return user.update(fields);
  }
  return User.create({
    id: idUser,
    idServer: idServer,
    ...fields,
  });
};
