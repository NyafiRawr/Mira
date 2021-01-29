import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize, alter, force } from '../database';
import Lot from './Lot';

export default class LotRelation extends Model {
  public lotteryId!: number;
  public userId!: string;
}

LotRelation.init(
  {
    lotteryId: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Lot,
        key: 'id',
      },
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'lot_relation',
    sequelize,
  }
);
