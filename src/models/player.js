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
  // максимальная длина ника (на официальном сервере)
  nickname: Sequelize.STRING(15),
  modes: Sequelize.ENUM('0', '1', '2', '3'),
}, {
  modelName: 'player',
  sequelize,
});

export default Player;
