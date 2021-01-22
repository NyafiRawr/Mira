import { Model, STRING, DATE } from 'sequelize';
import { sequelize } from '../database';

export default class MuteList extends Model {
  public serverId!: string;
  public userId!: string;
  public reason!: string;
  public executorId!: string;
  public channelName!: string;
  public releaseDate!: Date;
}

MuteList.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    reason: {
      type: STRING,
      allowNull: false,
    },
    executorId: {
      type: STRING,
      allowNull: false,
    },
    channelName: {
      type: STRING,
      allowNull: false,
    },
    releaseDate: {
      type: DATE,
      allowNull: false,
    },
  },
  {
    modelName: 'mute_list',
    sequelize,
  }
);

MuteList.sync({ force: false });
