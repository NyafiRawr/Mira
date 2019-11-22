import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';

class Player extends Model {}
Player.init({
  idUser: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  // названия известных проектов с учетом субдоменов имеют < 20 символов
  gameServer: {
    type: Sequelize.STRING(20),
    primaryKey: true,
  },
  // 15 - максимальная длина ника (на официальном сервере)
  nickname: Sequelize.STRING(15),
  // играемые моды
  mods: Sequelize.ENUM('0', '1', '2', '3'),
}, {
  modelName: 'player',
  sequelize,
});

export default Player;
