import User from '../models/user';
import CustomError from './customError';
import { sequelize } from './db';

const users = require('./users');

/**
 * Получение пользователя
 * @param {Number} serverId id сервера
 * @param {Number} userId id пользователя
 */
export const get = async (serverId, userId = null) => {
  if (userId !== null) {
    const user = await users.get(serverId, userId);

    if (user !== null) {
      return user.balance;
    }

    return 0;
  }

  return User.findAll({
    where: {
      serverId,
    },
  });
};

/**
 * Установка пользователю печенек, при необходимости добавляет в базу пользователя
 * @param {Number} serverId id сервера
 * @param {Number} userId id пользователя
 * @param {Number} currency сколько печенек установить
 */
export const set = async (serverId, userId, currency) => {
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
 * @param {Number} serverId id сервера
 * @param {Number} userId id пользователя у которого будут списаны печеньки
 * @param {Number} currency сколько печенек списать
 */
export const pay = async (serverId, userId, currency = 0) => {
  const balance = await get(serverId, userId);
  if (balance < currency) throw new CustomError('У вас нет сколько печенек!');

  await set(serverId, userId, -currency);
};


/**
 * Переводит печеньки между пользователями
 * @param {Number} serverId id сервера
 * @param {Number} userOutId id пользователя у которого будут списаны печеньки
 * @param {Number} userInId id пользователя которому будут добавлены печеньки
 * @param {Number} currency сколько печенек перевести
 */
export const transaction = async (serverId, userOutId, userInId, currency) => {
  const userOut = await users.get(serverId, userOutId);
  const userIn = await users.get(serverId, userInId);

  await sequelize.transaction(async (t) => {
    userOut.update({
      balance: userOut.balance - currency,
    }, { transaction: t });

    if (userIn !== null) {
      userIn.update({
        balance: userIn.balance + currency,
      }, { transaction: t });
    }

    User.create({
      id: userInId,
      serverId,
      balance: currency,
    }, { transaction: t });
  });
};

export const setWeight = async (serverId, userId, weight) => {
  const user = await users.get(serverId, userId);

  if (user !== null) {
    return user.update({
      weight: user.weight + weight,
    });
  }

  return User.create({
    id: userId,
    serverId,
    weight,
  });
};

export const getWeight = async (serverId, userId) => {
  const user = await users.get(serverId, userId);

  if (user !== null) {
    return user.weight;
  }

  return 0;
};
