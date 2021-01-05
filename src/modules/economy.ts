import User from '../models/User';
import * as users from './users';
import { separateThousandth } from '../utils';
import { sequelize } from '../database';

// Добавить / -Забрать печенье
export const setBalance = async (
  serverId: string,
  userId: string,
  currency: number
): Promise<User> => {
  let user = await users.get(serverId, userId);
  if (user == null) {
    user = await User.create({
      userId,
      serverId,
      balance: currency,
    });
  }
  // Для случаев когда -currency
  if (user.balance + currency < 0) {
    throw new Error(
      `тебе не хватает ${separateThousandth(
        Math.abs(currency).toString()
      )}:cookie:`
    );
  }
  return user.update({
    balance: user.balance + currency,
  });
};

// Перевод средств, возвращает плательщика
export const payTransaction = async (
  serverId: string,
  userOutId: string,
  userInId: string,
  currency = 0
): Promise<User> => {
  const userOut = await users.get(serverId, userOutId);
  const userIn = await users.get(serverId, userInId);

  if (userOut.balance < currency) {
    throw new Error(`тебе не хватает ${userOut.balance - currency} печенек!`);
  }

  return sequelize.transaction(async (t) => {
    const user = await userOut.update(
      {
        balance: userOut.balance - currency,
      },
      { transaction: t }
    );

    userIn.update(
      {
        balance: userIn.balance + currency,
      },
      { transaction: t }
    );

    return user;
  });
};
