import Player from '../models/player';

export const get = async (userId: string, gameServer: string = '') => {
  let player;

  if (gameServer) {
    player = await Player.findOne({
      where: {
        userId,
        gameServer,
      },
    });
  } else {
    player = await Player.findAll({
      where: {
        userId,
      },
    });
    for (let i = 0; i < player.length; i += 1) {
      player[i] = player[i].dataValues;
    }
  }

  return player;
};

export const set = async (userId: string, gameServer: string, fields: {[key: string]: any}) => {
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

export const remove = async (userId: string, gameServer: string) => {
  return Player.destroy({
    where: {
      userId,
      gameServer,
    },
  });
};
