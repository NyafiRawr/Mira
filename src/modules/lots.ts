import config from '../config';
import Lot from '../models/Lot';
import LotRelation from '../models/LotRelation';
import * as vars from './vars';

import { alter, force } from '../database';
Lot.sync({ alter, force });
LotRelation.sync({ alter, force });

export const keyMaxMembers = 'lottery_maxmembers';

export const get = async (serverId: string) =>
  Lot.findOne({
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
  return await Lot.create({
    serverId,
    userId,
    prize,
    membersWait,
  });
};

export const remove = async (lottery: Lot) => lottery.destroy();

export const getMembers = async (lotteryId: number) =>
  LotRelation.findAll({ where: { lotteryId } });

export const addMember = async (lotteryId: number, userId: string) =>
  LotRelation.create({ lotteryId, userId });

export const addMembers = async (lotteryId: number, userIds: string[]) =>
  LotRelation.bulkCreate(
    userIds.map((id) => {
      return { lotteryId, userId: id };
    })
    //, { ignoreDuplicates: true }
  );

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
