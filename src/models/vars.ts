import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../utils/db';

class Vars extends Model {
  public id!: number;
  public serverId!: string;

  public name!: string;
  public value!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vars.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
    },
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
    modelName: 'vars',
    sequelize,
  }
);

export default Vars;

Vars.sync();
