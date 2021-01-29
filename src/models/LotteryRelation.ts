import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize } from '../database';
import Lottery from './Lottery';

export default class LotteryMember extends Model {
  public lotteryId!: number;
  public userId!: string;
}

LotteryMember.init(
  {
    lotteryId: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Lottery,
        key: 'id',
      },
    },
    userId: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    modelName: 'lot_relation',
    sequelize,
  }
);

LotteryMember.sync({ force: true });
