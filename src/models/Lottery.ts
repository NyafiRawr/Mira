import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';

export default class Lottery extends Model {
  public serverId!: string;
  public userId!: string;
  public prize!: number;
  public membersWaitCount!: number;
  public memberIds!: string;
}

Lottery.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    prize: {
      type: INTEGER,
      allowNull: false,
    },
    membersWaitCount: {
      type: INTEGER,
      allowNull: false,
    },
    memberIds: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'lot',
    sequelize,
  }
);

Lottery.sync({ force: false });
