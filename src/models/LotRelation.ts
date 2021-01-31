import { INTEGER, Model, STRING } from 'sequelize';
import { sequelize } from '../database';
import Lot from './Lot';

export default class LotRelation extends Model {
  public id!: number;
  public lotteryId!: number;
  public userId!: string;
}

LotRelation.init(
  {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    lotteryId: {
      type: INTEGER,
      allowNull: false,
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
