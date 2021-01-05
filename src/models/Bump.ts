import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class Bump extends Model {
  public serverId!: string;
  public botId!: string;
  public award!: number;
  public sentence!: string;
}

Bump.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    botId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    award: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sentence: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'bump',
    sequelize,
  }
);

Bump.sync();
