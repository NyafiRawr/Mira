import { INTEGER, Model, STRING, TEXT } from 'sequelize';
import { sequelize, alter, force } from '../database';

export default class Var extends Model {
  public id!: number;
  public serverId!: string;
  public key!: string;
  public value!: string;
}

Var.init(
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
      unique: 'varId',
    },
    key: {
      type: STRING,
      allowNull: false,
      unique: 'varId',
    },
    value: {
      type: TEXT,
      allowNull: false,
    },
  },
  {
    modelName: 'var',
    sequelize,
  }
);

Var.sync({ alter, force });
