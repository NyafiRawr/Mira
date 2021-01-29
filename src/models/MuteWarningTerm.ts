import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class MuteWarningTerm extends Model {
  public id!: number;
  public serverId!: string;
  public countWarnings!: number;
  public forDays!: number;
  public timestamp!: number;
}

MuteWarningTerm.init(
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
    countWarnings: {
      type: INTEGER,
      allowNull: false,
    },
    forDays: {
      type: INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: 'mute_warning_term',
    sequelize,
  }
);

MuteWarningTerm.sync({ alter: true });
