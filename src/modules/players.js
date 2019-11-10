import Player from '../models/player';

export const get = async (idUser, gameServer = null) => {
  let player;

  if (gameServer) {
    player = await Player.findOne({
      where: {
        idUser: idUser,
        gameServer: gameServer,
      },
    });
  } else {
    player = await Player.findAll({
      where: {
        idUser: idUser,
      },
    });
  }

  return player;
};

export const set = async (idUser, gameServer, fields) => {
  const player = await Player.findOne({
    where: {
      idUser: idUser,
      gameServer: gameServer,
    },
  });

  if (player != null) {
    return player.update(fields);
  }

  return Player.create({
    idUser: idUser,
    gameServer: gameServer,
  }, fields);
};
