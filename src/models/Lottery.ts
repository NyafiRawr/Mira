import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';
import LotteryRelation from './LotteryRelation';

export default class Lottery extends Model {
  public id!: number;
  public serverId!: string;
  public userId!: string;
  public prize!: number;
  public membersWait!: number;
}

Lottery.init(
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
    membersWait: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    modelName: 'lot_list',
    sequelize,
  }
);

Lottery.hasMany(LotteryRelation, { as: 'lot_lists', foreignKey: 'lotteryId' });

Lottery.sync({ force: true });
