import User from '../models/user';
import { sequelize } from './db';

const users = require('./users');

export const get = async (idServer, idUser = null) => {
  if (idUser != null) {
    const user = await users.get(idServer, idUser);

    if (user != null) {
      return user.balance;
    }

    return 0;
  }

  // eslint-disable-next-line no-return-await
  return await User.findAll({
    where: {
      idServer: idServer,
    },
  });
};

export const set = async (idServer, idUser, currency) => {
  const user = await users.get(idServer, idUser);

  if (user != null) {
    return user.update({
      balance: user.balance + currency,
    });
  }

  return User.create({
    id: idUser,
    idServer: idServer,
    balance: currency,
  })
};

export const transaction = async (idServer, idUserOut, idUserIn, currency) => {
  const userOut = await users.get(idServer, idUserOut);
  const userIn = await users.get(idServer, idUserIn);
  await sequelize.transaction(async (t) => {
    userOut.update({
      balance: userOut.balance - currency,
    }, { transaction: t });

    if (userIn != null) {
      userIn.update({
        balance: userIn.balance + currency,
      }, { transaction: t });
    }

    User.create({
      id: idUserIn,
      idServer: idServer,
      balance: currency,
    }, { transaction: t });
  })
};
