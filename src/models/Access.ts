import { Model, STRING } from 'sequelize';
import { sequelize, alter, force } from '../database';

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

Access.sync({ alter, force });
