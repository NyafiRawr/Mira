import config from '../config';
import Lottery from '../models/Lottery';
import LotteryRelation from '../models/LotteryRelation';
import * as vars from './vars';

export const keyMaxMembers = 'lottery_maxmembers';

export const get = async (serverId: string) =>
  Lottery.findOne({
    where: { serverId },
  });

export const set = async (
  serverId: string,
  userId: string,
  prize: number,
  membersWait: number
) => {
  const oldLot = await get(serverId);
  if (oldLot !== null) {
    return await oldLot.update({ userId, prize, membersWait });
  }
  return await Lottery.create({
    serverId,
    userId,
    prize,
    membersWait,
  });
};

export const getMembers = async (lotteryId: number) =>
  LotteryRelation.findAll({ where: { lotteryId } });

export const addMember = async (lotteryId: number, userId: string) =>
  LotteryRelation.create({ lotteryId, userId });

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
