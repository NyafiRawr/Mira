import { Model, STRING, DATE, NOW } from 'sequelize';
import { sequelize } from '../db';

class Warning extends Model {
  public serverId!: string;
  public userId!: string;
  public date!: Date;
  public reason!: string;
}

Warning.init(
  {
    serverId: STRING,
    userId: STRING,
    date: {
      type: DATE,
      defaultValue: NOW,
    },
    reason: {
      type: STRING,
      defaultValue: 'Нет',
    },
  },
  {
    modelName: 'warning',
    sequelize,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
);

export default Warning;

Warning.sync();
