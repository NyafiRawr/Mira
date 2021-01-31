import { Model, STRING, INTEGER, DATE, NOW } from 'sequelize';
import { sequelize } from '../database';
import Gild from './Gild';

export default class GildRelation extends Model {
  public id!: number;
  public serverId!: string;
  public userId!: string;
  public gildId!: number;
  public entryDate!: Date;
}

GildRelation.init(
  {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
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
