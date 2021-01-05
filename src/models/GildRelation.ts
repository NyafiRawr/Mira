import { Model, STRING, INTEGER, DATE, NOW } from 'sequelize';
import { sequelize } from '../database';
import Gild from './Gild';

export default class GildRelation extends Model {
  public serverId!: string;
  public userId!: string;
  public gildId!: number;
  public entryDate!: Date;
}

GildRelation.init(
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
    gildId: {
      type: INTEGER,
      references: {
        model: Gild,
        key: 'gildId',
      },
    },
    entryDate: {
      type: DATE,
      allowNull: false,
      defaultValue: NOW,
    },
  },
  {
    modelName: 'gild_relation',
    sequelize,
  }
);

GildRelation.sync();
