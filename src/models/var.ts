import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Var extends Model {
  public serverId!: string;
  public name!: string;
  public value!: string;
}

Var.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    name: {
      type: STRING,
      primaryKey: true,
    },
    value: {
      type: STRING,
    },
  },
  {
    modelName: 'var',
    sequelize,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
);

export default Var;

Var.sync();
