import { Model, STRING, DATE, NOW, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class MuteWarningList extends Model {
  public id!: number;
  public serverId!: string;
  public userId!: string;
  public reason!: string;
  public executorId!: string;
  public channelName!: string;
  public date!: Date;
}

MuteWarningList.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    serverId: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: false,
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

MuteWarningList.sync({ force: false });
