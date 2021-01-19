import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class Access extends Model {
  public serverId!: string | null;
  public channelId!: string | null;
  public commandName!: string | null;
}

Access.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    channelId: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    commandName: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    modelName: 'access',
    sequelize,
  }
);

Access.sync({ force: false });
