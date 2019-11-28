import Sequelize, { Model } from 'sequelize';
import { sequelize } from '../modules/db';

class Player extends Model {}
Player.init({
  userId: {
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
  // играемые режимы
  modes: Sequelize.ENUM('0', '0,1', '0,2', '0,3', '0,1,2', '0,1,3', '0,2,3', '0,1,2,3',
    '1', '1,2', '1,3', '1,2,3',
    '2', '2,3',
    '3'),
}, {
  modelName: 'player',
  sequelize,
});

export default Player;

Player.sync();
