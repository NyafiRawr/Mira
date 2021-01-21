import { Model, STRING, DATE, NOW } from 'sequelize';
import { sequelize } from '../database';

export default class MuteWarningList extends Model {
  public serverId!: string;
  public userId!: string;
  public reason!: string;
  public executorId!: string;
  public channelName!: string;
  public date!: Date;
}

MuteWarningList.init(
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
    date: {
      type: DATE,
      allowNull: false,
      defaultValue: NOW,
    },
  },
  {
    modelName: 'mute_warning_list',
    sequelize,
  }
);

MuteWarningList.sync();
