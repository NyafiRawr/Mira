import { Model, STRING, ENUM } from 'sequelize';
import { sequelize } from '../modules/db';


class Player extends Model {
  public id!: number;
  public userId!: string;
  public gameServer!: string;
  public nickname!: string;
  public modes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
  {
    userId: {
      type: STRING,
      primaryKey: true,
    },
    // названия известных проектов с учетом субдоменов имеют < 20 символов
    gameServer: {
      type: STRING(20),
      primaryKey: true,
    },
    // 15 - максимальная длина ника (на официальном сервере)
    nickname: STRING(15),
    // играемые режимы
    modes: ENUM(
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
  },
  {
    modelName: 'player',
    sequelize,
  }
);

export default Player;

Player.sync();
