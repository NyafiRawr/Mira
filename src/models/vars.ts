import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class Vars extends Model {
  public serverId!: string;

  public name!: string;
  public value!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vars.init(
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
    modelName: 'vars',
    sequelize,
  }
);

export default Vars;

Vars.sync();
