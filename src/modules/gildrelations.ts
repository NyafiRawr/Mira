import GildRelations from '../models/GildRelation';

export const getOne = async (
  serverId: string,
  userId: string
): Promise<GildRelations | null> =>
  GildRelations.findOne({
    where: {
      serverId,
      userId,
    },
  });

export const getAll = async (
  serverId: string,
  gildId: number
): Promise<GildRelations[]> =>
  GildRelations.findAll({
    where: {
      serverId,
      gildId,
    },
  });

export const create = async (
  serverId: string,
  userId: string,
  gildId: number
): Promise<GildRelations> =>
  GildRelations.create({
    serverId,
    userId,
    gildId,
  });

export const remove = async (
  serverId: string,
  userId: string
): Promise<void> => {
  const relation = await getOne(serverId, userId);
  if (relation != null) {
    return relation.destroy();
  }
};
