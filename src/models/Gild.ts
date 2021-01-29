import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize, alter, force } from '../database';
import GildRelation from './GildRelation';

export default class Gild extends Model {
  public serverId!: string;
  public id!: number;
  public ownerId!: string;
  public name!: string;
  public description?: string | null;
  public imageURL?: string | null;
  public channels?: string | null;
  public balance!: number;
}

Gild.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
    },
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ownerId: {
      type: STRING,
      allowNull: false,
    },
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
      validate: {
        isUrl: true,
      },
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

Gild.hasMany(GildRelation, { foreignKey: 'gildId' });
