import { Model, STRING, BOOLEAN } from 'sequelize';
import { sequelize } from '../db';

class Stream extends Model {
  public serverId!: string;
  public state!: boolean;
  public roleId!: string;
  public games!: string;
}

Stream.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    state: {
      type: BOOLEAN,
      defaultValue: false,
    },
    roleId: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    games: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    modelName: 'stream',
    sequelize,
  }
);

export default Stream;

Stream.sync();
