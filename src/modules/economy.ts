import User from '../models/user';
import CustomError from '../utils/customError';
import { sequelize } from '../db';
import * as users from './users';
import { roundDecimalPlaces } from '../utils/tools';

/**
 * Установка пользователю печенек, при необходимости добавляет в базу пользователя
 * @param {String} serverId id сервера
 * @param {String} userId id пользователя
 * @param {Number} currency сколько печенек установить
 */
export const set = async (
  serverId: string,
  userId: string,
  currency: number
) => {
  const user = await users.get(serverId, userId);

  if (user !== null) {
    return user.update({
      balance: user.balance + currency,
    });
  }

  return User.create({
    id: userId,
    serverId,
    balance: currency,
  });
};

/**
 * Списывает у пользователя печенье
 * @param {String} serverId id сервера
 * @param {String} userId id пользователя у которого будут списаны печеньки
 * @param {Number} currency сколько печенек списать
 */
export const pay = async (
  serverId: string,
  userId: string,
  currency: number = 0
) => {
  const user = await users.get(serverId, userId);
  if (user === null || user.balance < currency) {
    throw new CustomError('у тебя нет столько печенья!');
  }

  await set(serverId, userId, -currency);
};

/**
 * Переводит печеньки между пользователями
 * @param {String} serverId id сервера
 * @param {String} userOutId id пользователя у которого будут списаны печеньки
 * @param {String} userInId id пользователя которому будут добавлены печеньки
 * @param {Number} currency сколько печенек перевести
 */
export const transaction = async (
  serverId: string,
  userOutId: string,
  userInId: string,
  currency: number
) => {
  const userOut = await users.get(serverId, userOutId);
  const userIn = await users.get(serverId, userInId);
  if (userOut === null || userIn === null) {
    throw new CustomError('пользователь не найден');
  }

  await sequelize.transaction(async t => {
    userOut.update(
      {
        balance: userOut.balance - currency,
      },
      { transaction: t }
    );

    if (userIn !== null) {
      userIn.update(
        {
          balance: userIn.balance + currency,
        },
        { transaction: t }
      );
    }

    User.create(
      {
        id: userInId,
        serverId,
        balance: currency,
      },
      { transaction: t }
    );
  });
};

export const setWeight = async (
  serverId: string,
  userId: string,
  weight: number
) => {
  const user = await users.get(serverId, userId);

  if (user !== null) {
    return user.update({
      weight: +roundDecimalPlaces(user.weight + weight, 2),
    });
  }

  return User.create({
    id: userId,
    serverId,
    weight,
  });
};

export const getWeight = async (serverId: string, userId: string) => {
  const user = await users.get(serverId, userId);

  if (user !== null) {
    return user.weight;
  }

  return 0;
};
