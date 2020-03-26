import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Guild extends Model {
  public serverId!: string;
  public id!: string;
  public token!: number;
}

Guild.init(
  {
    serverId: STRING,
    guildId: {
      type: STRING,
      primaryKey: true,
      autoIncrement: true
    },
    name: STRING,
    ownerId: STRING
  },
  {
    modelName: 'guild',
    sequelize,
  }
);

export default Guild;

Guild.sync();
