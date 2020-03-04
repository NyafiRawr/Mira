import { Model, STRING } from 'sequelize';
import { sequelize } from '../db';

class Vars extends Model {
  public serverId!: string;

  public name!: string;
  public value!: string;
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
