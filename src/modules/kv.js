import Keyv from 'keyv';
import { convertSecondsToTime } from './tools';

const cooldowns = new Keyv({ namespace: 'cooldown' });

export const get = async (idServer, idUser, commandName) => {
  const datetimeCooldown = await cooldowns.get(`${idServer}_${idUser}_${commandName}`);

  if (datetimeCooldown) {
    const datetimeLeft = new Date(new Date(datetimeCooldown) - Date.now());
    return convertSecondsToTime(datetimeLeft.getTime() / 1000);
  }
  return null;
};

export const reset = async (idServer, idUser, commandName) => {
  await cooldowns.delete(`${idServer}_${idUser}_${commandName}`);
};

export const set = async (idServer, idUser, commandName, seconds) => {
  const timeCooldown = new Date(seconds * 1000 + Date.now());
  await cooldowns.set(`${idServer}_${idUser}_${commandName}`, timeCooldown);
  setTimeout(() => reset(idServer, idUser, commandName), seconds * 1000);
};
