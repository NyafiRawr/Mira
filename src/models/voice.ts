import { Model, STRING, INTEGER } from 'sequelize';
import { sequelize } from '../db';

class Voice extends Model {
  public serverId!: string;
  public categoryId!: string;
  public price!: number;
}

Voice.init(
  {
    serverId: {
      type: STRING,
      primaryKey: true,
    },
    categoryId: STRING,
    price: INTEGER,
  },
  {
    modelName: 'voice',
    sequelize,
  }
);

export default Voice;

Voice.sync();