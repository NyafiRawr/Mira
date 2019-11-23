import Keyv from 'keyv';
import { convertSecondsToTime } from './tools';

const cooldowns = new Keyv({ namespace: 'cooldown' });

/**
 * Получение текущего кулдауна с учетом сервера и команды
 * @param {*} serverId идентификатор сервера
 * @param {*} userId идентификатор пользователя
 * @param {*} commandName название команды
 */
export const get = async (serverId, userId, commandName) => {
  const datetimeCooldown = await cooldowns.get(`${serverId}_${userId}_${commandName}`);

  if (datetimeCooldown) {
    const datetimeLeft = new Date(new Date(datetimeCooldown) - Date.now());
    return convertSecondsToTime(datetimeLeft.getTime() / 1000);
  }
  return null;
};

/**
 * Сброс кулдауна
 * @param {*} serverId идентификатор сервера
 * @param {*} userId идентификатор пользователя
 * @param {*} commandName название команды
 */
export const reset = async (serverId, userId, commandName) => {
  await cooldowns.delete(`${serverId}_${userId}_${commandName}`);
};

/**
 * Установка кулдауна пользователя
 * @param {*} serverId идентификатор сервера
 * @param {*} userId идентификатор пользователя
 * @param {*} commandName название команды
 * @param {*} seconds время в секундах
 */
export const set = async (serverId, userId, commandName, seconds) => {
  const timeCooldown = new Date(seconds * 1000 + Date.now());
  await cooldowns.set(`${serverId}_${userId}_${commandName}`, timeCooldown);
  setTimeout(() => reset(serverId, userId, commandName), seconds * 1000);
};
