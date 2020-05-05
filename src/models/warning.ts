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
    reason: STRING
  },
  {
    modelName: 'warning',
    sequelize,
  }
);

export default Warning;

Warning.sync();
