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
    roleId: STRING,
    games: STRING,
  },
  {
    modelName: 'stream',
    sequelize,
  }
);

export default Stream;

Stream.sync();
