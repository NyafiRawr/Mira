import config from '../config';
import Lottery from '../models/Lottery';
import * as vars from './vars';

export const keyMaxMembers = 'lottery_maxmembers';

export const get = async (serverId: string) =>
  Lottery.findOne({
    where: { serverId },
  });

export const set = async (lottery: Lottery) => {
  const lot = await get(lottery.serverId);
  if (lot !== null) {
    return lot.update(lottery);
  }
  return Lottery.create(lottery);
};

export const getMaxMembers = async (serverId: string): Promise<number> => {
  const variable = await vars.getOne(serverId, keyMaxMembers);
  if (variable === null) {
    return config.games.lottery.maxMembers;
  }

  return parseInt(variable.value, 10);
};

export const setMaxMembers = async (
  serverId: string,
  maxMembers: number
): Promise<void> => {
  const variable = await vars.getOne(serverId, keyMaxMembers);
  if (variable === null) {
    await vars.set(serverId, keyMaxMembers, maxMembers.toString());
  } else {
    await variable.update({ value: maxMembers.toString() });
  }
};
