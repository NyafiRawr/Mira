import { Model, STRING, ENUM, BOOLEAN } from 'sequelize';
import { sequelize } from '../db';

class Player extends Model {
  public userId!: string;
  public nickname!: string;
  public gameServer!: string;
  public gameServerFavorite!: boolean;
  public modeFavorite!: string;
  public modes!: string;
}

Player.init(
  {
    userId: {
      type: STRING,
      primaryKey: true,
    },
    // Максимальная длина ника: 15 символов (на официальном сервере)
    nickname: STRING(15),
    // Названия известных проектов с учетом субдоменов имеют < 20 символов
    gameServer: {
      type: STRING(20),
      primaryKey: true,
    },
    // Является ли этот аккаунт основным?
    gameServerFavorite: {
      type: BOOLEAN,
      defaultValue: false,
    },
    // Избранный режим (вызываемый по умолчанию), только один
    modeFavorite: {
      type: ENUM('0', '1', '2', '3'),
      defaultValue: '0',
    },
    // Играемые режимы (включая избранный)
    modes: {
      type: ENUM(
        '0',
        '0,1',
        '0,2',
        '0,3',
        '0,1,2',
        '0,1,3',
        '0,2,3',
        '0,1,2,3',
        '1',
        '1,2',
        '1,3',
        '1,2,3',
        '2',
        '2,3',
        '3'
      ),
      defaultValue: '0',
    },
  },
  {
    modelName: 'player',
    sequelize,
  }
);

export default Player;

Player.sync();
