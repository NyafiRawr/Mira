import { Model, STRING } from 'sequelize';
import { sequelize } from '../database';

export default class Var extends Model {
  public serverId!: string;
  public key!: string;
  public value!: string;
}

Var.init(
  {
    serverId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    key: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    value: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'var',
    sequelize,
  }
);

Var.sync();
