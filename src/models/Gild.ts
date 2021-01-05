import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../database';
import GildRelation from './GildRelation';

export default class Gild extends Model {
  public serverId!: string;
  public gildId!: number;
  public ownerId!: string;
  public name!: string;
  public description?: string | null;
  public imageURL?: string | null;
  public channels?: string | null;
  public balance!: number;
}

Gild.init(
  {
    serverId: STRING,
    gildId: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ownerId: STRING,
    name: STRING,
    description: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    imageURL: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    channels: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    balance: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    modelName: 'gild',
    sequelize,
  }
);

Gild.hasMany(GildRelation, { as: 'gild_relations', foreignKey: 'gildId' });

Gild.sync();
