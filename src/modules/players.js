import Player from '../models/player';

export const get = async (userId, gameServer = null) => {
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
  }

  return player;
};

export const set = async (userId, gameServer, fields) => {
  const player = await Player.findOne({
    where: {
      userId,
      gameServer,
    },
  });

  if (player != null) {
    return player.update(fields);
  }

  return Player.create({
    userId,
    gameServer,
  }, fields);
};
