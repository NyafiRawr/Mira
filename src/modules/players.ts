import Player from '../models/player';

export const get = async (
  userId: string,
  gameServer: string = ''
): Promise<Player|null> =>
  Player.findOne({
    where: {
      userId,
      gameServer,
    },
  });

export const getAll = async (
  userId: string
): Promise<Player[]|null> =>
  Player.findAll({
    where: {
      userId,
    },
  });

export const set = async (
  userId: string,
  gameServer: string,
  fields: { [key: string]: any }
) => {
  const player = await get(userId, gameServer);

  if (player != null) {
    return player.update(fields);
  }

  return Player.create({
    userId,
    gameServer,
    ...fields,
  });
};

export const remove = async (userId: string, gameServer: string) =>
  Player.destroy({
    where: {
      userId,
      gameServer,
    },
  });
