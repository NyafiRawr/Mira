import { Model, STRING, INTEGER, DATE, NOW } from 'sequelize';
import { sequelize, alter, force } from '../database';
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
      unique: 'relationId',
    },
    userId: {
      type: STRING,
      allowNull: false,
      unique: 'relationId',
    },
    gildId: {
      type: INTEGER,
      references: {
        model: Gild,
        key: 'id',
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
