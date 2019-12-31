import * as Keyv from 'keyv';
import { convertSecondsToTime } from './tools';

const cooldowns = new Keyv({ namespace: 'cooldown' });

/**
 * Получение текущего кулдауна с учетом сервера и команды
 * @param {String} serverId идентификатор сервера
 * @param {String} userId идентификатор пользователя
 * @param {String} commandName название команды
 */
export const get = async (serverId: string, userId: string, commandName: string) => {
  const datetimeCooldown: string = await cooldowns.get(`${serverId}_${userId}_${commandName}`);

  if (datetimeCooldown) {
    const firstDate = (new Date(datetimeCooldown)).getTime();
    const now = Date.now();

    const datetimeLeft = new Date(firstDate - now);
    return convertSecondsToTime(datetimeLeft.getTime() / 1000);
  }
  return null;
};

/**
 * Сброс кулдауна
 * @param {String} serverId идентификатор сервера
 * @param {String} userId идентификатор пользователя
 * @param {String} commandName название команды
 */
export const reset = async (serverId: string, userId: string, commandName: string) => {
  await cooldowns.delete(`${serverId}_${userId}_${commandName}`);
};

/**
 * Установка кулдауна пользователя
 * @param {String} serverId идентификатор сервера
 * @param {String} userId идентификатор пользователя
 * @param {String} commandName название команды
 * @param {String} seconds время в секундах
 */
export const set = async (serverId: string, userId: string, commandName: string, seconds: number) => {
  const timeCooldown = new Date(seconds * 1000 + Date.now());
  await cooldowns.set(`${serverId}_${userId}_${commandName}`, timeCooldown);
  setTimeout(() => reset(serverId, userId, commandName), seconds * 1000);
};
